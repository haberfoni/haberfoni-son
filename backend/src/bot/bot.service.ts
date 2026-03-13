import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { AiService } from '../ai/ai.service';
import { scrapeAA } from './scrapers/aa.scraper';
import { scrapeIHA } from './scrapers/iha.scraper';
import { scrapeDHA } from './scrapers/dha.scraper';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class BotService implements OnModuleInit {
    private readonly logger = new Logger(BotService.name);
    private readonly UPLOAD_DIR = path.join(process.cwd(), '..', 'public', 'uploads');

    constructor(
        private prisma: PrismaService,
        private activityLogsService: ActivityLogsService,
        private aiService: AiService
    ) {
        if (!fs.existsSync(this.UPLOAD_DIR)) {
            fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
        }
    }

    async onModuleInit() {
        this.logger.log('BotService initialized');
        await this.cleanupStuckCommands();
        await this.ensureBotSettings();
    }

    async ensureBotSettings() {
        try {
            const agencies = ['AA', 'IHA', 'DHA'];
            for (const agency of agencies) {
                await this.prisma.botSetting.upsert({
                    where: { source_name: agency },
                    update: { is_active: true, auto_publish: true },
                    create: { source_name: agency, is_active: true, auto_publish: true }
                });
            }
            this.logger.log('Bot settings ensured: AA, IHA, DHA are ACTIVE and AUTO_PUBLISH is ON');
        } catch (error) {
            this.logger.error(`Failed to ensure bot settings: ${error.message}`);
        }
    }

    async cleanupStuckCommands() {
        try {
            const result = await this.prisma.botCommand.updateMany({
                where: {
                    status: { in: ['PENDING', 'PROCESSING'] }
                },
                data: {
                    status: 'FAILED',
                    payload: 'System restarted while task was pending/processing.',
                    executed_at: new Date() // Mark the time it was failed
                }
            });
            if (result.count > 0) {
                this.logger.warn(`Cleaned up ${result.count} stuck bot commands.`);
            }
        } catch (error) {
            this.logger.error(`Failed to cleanup stuck commands: ${error.message}`);
        }
    }

    async createCommand(type: string) {
        return this.prisma.botCommand.create({
            data: {
                command: type,
                status: 'PENDING'
            }
        });
    }

    async getLatestCommand() {
        return this.prisma.botCommand.findFirst({
            orderBy: { created_at: 'desc' }
        });
    }

    @Cron('*/5 * * * *')
    async handleCron() {
        this.logger.log('Starting scheduled scrape cycle (5 min frequency)...');
        await this.scrapeAll();
    }

    async scrapeAll(commandId?: number) {
        // PREVENT OVERLAPPING: Check if any command is currently PROCESSING
        const activeCommand = await this.prisma.botCommand.findFirst({
            where: { status: 'PROCESSING' }
        });

        if (activeCommand && (!commandId || activeCommand.id !== commandId)) {
            this.logger.warn(`Scrape cycle skipped. Another command is already PROCESSING: ID ${activeCommand.id}`);
            // If this was a PENDING command that we're trying to start, mark it as FAILED/SKIPPED
            if (commandId) {
                await this.prisma.botCommand.update({
                    where: { id: commandId },
                    data: { status: 'FAILED', payload: 'Another process is already running.' }
                }).catch(() => { });
            }
            return;
        }

        let cmdId = commandId;

        // If no commandId provided (e.g. Cron), create one
        if (!cmdId) {
            try {
                const cmd = await this.prisma.botCommand.create({
                    data: {
                        command: 'CRON_RUN',
                        status: 'PROCESSING',
                        executed_at: new Date()
                    }
                });
                cmdId = cmd.id;
            } catch (e) {
                this.logger.error(`Failed to create bot command record: ${e.message}`);
            }
        } else {
            // Update existing command to PROCESSING
            try {
                await this.prisma.botCommand.update({
                    where: { id: cmdId },
                    data: { status: 'PROCESSING', executed_at: new Date() }
                });
            } catch (e) {
                this.logger.error(`Failed to update bot command status to PROCESSING: ${e.message}`);
                // If we can't update status, we should probably stop or at least log heavily
            }
        }

        try {
            this.logger.log('Starting full scrape for all agencies...');
            this.logger.log('Starting full scrape for all agencies sequentially...');
            const mappingsCount = await this.prisma.botCategoryMapping.count({ where: { is_active: true } });
            this.logger.log(`Active mappings found: ${mappingsCount}`);

            const results: any[] = [];
            
            this.logger.log('Running AA Scraper...');
            try {
                const res = await scrapeAA(this);
                results.push({ status: 'fulfilled', value: res });
            } catch (err) {
                results.push({ status: 'rejected', reason: err });
            }

            this.logger.log('Running IHA Scraper...');
            try {
                const res = await scrapeIHA(this);
                results.push({ status: 'fulfilled', value: res });
            } catch (err) {
                results.push({ status: 'rejected', reason: err });
            }

            this.logger.log('Running DHA Scraper...');
            try {
                const res = await scrapeDHA(this);
                results.push({ status: 'fulfilled', value: res });
            } catch (err) {
                results.push({ status: 'rejected', reason: err });
            }

            this.logger.log(`Scraper execution summaries:`);
            results.forEach((res, i) => {
                const agency = ['AA', 'IHA', 'DHA'][i];
                if (res.status === 'fulfilled') {
                    this.logger.log(`${agency}: Scraper finished (fulfilled). Result: ${JSON.stringify(res.value)}`);
                } else {
                    this.logger.error(`${agency}: Scraper FAILED (rejected). Reason: ${res.reason}`);
                }
            });

            if (cmdId) {
                await this.prisma.botCommand.update({
                    where: { id: cmdId },
                    data: { status: 'COMPLETED' }
                });
            }
            this.logger.log('Scrape cycle finished.');
            await this.activityLogsService.create({
                action_type: 'BOT_RUN',
                entity_type: 'BOT',
                description: 'Haber botu otomatik tarama döngüsünü başarıyla tamamladı.'
            }).catch(() => { });
        } catch (error) {
            this.logger.error(`Scrape cycle failed: ${error.message}`);
            if (cmdId) {
                await this.prisma.botCommand.update({
                    where: { id: cmdId },
                    data: { status: 'FAILED', payload: error.message }
                });
            }
        }
    }

    // --- DB Helpers for Scrapers ---

    async getSettings() {
        return this.prisma.botSetting.findMany({
            orderBy: { source_name: 'asc' }
        });
    }

    async updateSetting(id: number, data: any) {
        return this.prisma.botSetting.update({
            where: { id },
            data
        });
    }

    async getAllMappings() {
        return this.prisma.botCategoryMapping.findMany({
            orderBy: { source_name: 'asc' }
        });
    }

    async getBotMappings(sourceName: string) {
        return this.prisma.botCategoryMapping.findMany({
            where: { source_name: sourceName }, // include inactive so admin can manage them
        });
    }

    async addMapping(data: any) {
        try {
            return await this.prisma.botCategoryMapping.create({
                data
            });
        } catch (error) {
            this.logger.error(`Error adding mapping: ${error.message}`);
            throw error;
        }
    }

    async deleteMapping(id: number) {
        return this.prisma.botCategoryMapping.delete({
            where: { id }
        });
    }

    async toggleMapping(id: number, isActive: boolean) {
        return this.prisma.botCategoryMapping.update({
            where: { id },
            data: { is_active: isActive, updated_at: new Date() }
        });
    }

    async resetBotCommands() {
        return this.prisma.botCommand.updateMany({
            where: {
                status: { in: ['PENDING', 'PROCESSING'] }
            },
            data: {
                status: 'FAILED',
                payload: 'Manually reset by admin.',
                executed_at: new Date()
            }
        });
    }

    async updateMappingStatus(url: string, status: string, count: number, error?: string) {
        try {
            await this.prisma.botCategoryMapping.update({
                where: { source_url: url },
                data: {
                    last_scraped_at: new Date(),
                    last_status: status,
                    last_item_count: count,
                    last_error: error || null
                }
            });
        } catch (e) {
            this.logger.error(`Error updating mapping status for ${url}: ${e.message}`);
        }
    }

    private async downloadImage(url: string | null | undefined, source: string, type: string): Promise<string | null> {
        if (!url || !url.startsWith('http')) return url || null;

        try {
            const hash = crypto.createHash('md5').update(url).digest('hex');
            const urlPath = new URL(url).pathname;
            const ext = path.extname(urlPath) || '.jpg';
            const filename = `${source.toLowerCase()}_${type}_${hash}${ext}`;
            const filepath = path.join(this.UPLOAD_DIR, filename);

            // Check if already exists
            if (fs.existsSync(filepath)) {
                return `/uploads/${filename}`;
            }

            // Download
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Referer': new URL(url).origin
                },
                timeout: 10000
            });

            fs.writeFileSync(filepath, response.data);
            this.logger.debug(`Downloaded image: ${filename} from ${url}`);
            return `/uploads/${filename}`;
        } catch (error) {
            this.logger.warn(`Failed to download image from ${url}: ${error.message}`);
            return url; // Fallback to original URL
        }
    }

    async saveVideo(data: any) {
        try {
            // Check for generic titles
            if (this.isGenericTitle(data.title)) {
                this.logger.verbose(`Skipping generic video title: ${data.title}`);
                return false;
            }

            // Check for duplicate by original_url
            if (data.original_url) {
                const existing = await this.prisma.video.findFirst({
                    where: { original_url: data.original_url }
                });
                if (existing) {
                    // Update title if existing one is 'Video' or empty
                    if (existing.title.toLowerCase() === 'video' || !existing.title) {
                        await this.prisma.video.update({
                            where: { id: existing.id },
                            data: { title: data.title }
                        });
                        this.logger.log(`Updated title for existing video: ${data.title}`);
                        return true;
                    }
                    this.logger.verbose(`Skipping existing video: ${data.title}`);
                    return false;
                }
            }

            // DHA Specific: If a gallery with same title exists, skip video
            if (data.source === 'DHA') {
                const galleryExists = await this.prisma.photoGallery.findFirst({
                    where: { title: data.title, source: 'DHA' }
                });
                if (galleryExists) {
                    this.logger.verbose(`Skipping DHA video because gallery exists: ${data.title}`);
                    return false;
                }
            }

            // Check if source is active
            const settings = await this.prisma.botSetting.findUnique({
                where: { source_name: data.source }
            });
            if (settings && !settings.is_active) {
                this.logger.verbose(`Source ${data.source} is inactive, skipping video.`);
                return false;
            }

            const slug = data.slug || this.slugify(data.title);
            
            // 3.5 AI Rewrite if enabled
            let finalTitle = data.title;
            let finalDescription = data.description || '';
            let aiModel: string | null = null;
            let author = data.author || data.source;
            let seoTitle = data.title;
            let seoDescription = data.description
                ? data.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 160)
                : '';
            let seoKeywords = this.generateKeywords(data.title);

            if (settings && settings.use_ai_rewrite) {
                this.logger.log(`AI Rewrite is active for Video from ${data.source}. Attempting rewrite...`);
                const rewritten = await this.aiService.rewriteVisualContent(data.title, data.description || '');
                if (rewritten) {
                    finalTitle = rewritten.title;
                    finalDescription = rewritten.description;
                    seoTitle = rewritten.seo_title;
                    seoDescription = rewritten.seo_description;
                    seoKeywords = rewritten.seo_keywords;
                    author = 'Yapay Zeka Editörü';
                    aiModel = rewritten.model; 
                    this.logger.log(`AI Rewrite SUCCESS for video: ${finalTitle} (${aiModel})`);
                } else {
                    this.logger.warn(`AI Rewrite FAILED or SKIPPED for video: ${data.title}`);
                }
                await new Promise(resolve => setTimeout(resolve, 4500));
            }

            // 3.5 AI Rewrite if enabled (skipped for brief) ...
            
            // 3.6 Download Thumbnail
            let localThumbnail = data.thumbnail_url;
            if (data.thumbnail_url && data.thumbnail_url.startsWith('http')) {
                const downloaded = await this.downloadImage(data.thumbnail_url, data.source, 'video');
                if (downloaded) localThumbnail = downloaded;
            }

            // 4. Create Video
            const createdVideo = await this.prisma.video.create({
                data: {
                    title: finalTitle,
                    slug,
                    description: finalDescription,
                    video_url: data.video_url,
                    thumbnail_url: localThumbnail,
                    source: data.source,
                    author: author,
                    ai_model: aiModel,
                    original_url: data.original_url,
                    published_at: new Date(),
                    seo_title: seoTitle,
                    seo_description: seoDescription,
                    seo_keywords: seoKeywords
                }
            });

            // 3.6 Tags
            if (seoKeywords) {
                const tagIds = await this.getOrCreateTags(seoKeywords);
                await this.syncVideoTags(createdVideo.id, tagIds);
            }

            this.logger.log(`Successfully saved video: ${finalTitle} (Source: ${data.source})`);
            return true;
        } catch (error) {
            this.logger.error(`Error saving video [${data.title}] from ${data.source}: ${error.message}`);
            return false;
        }
    }

    async saveGallery(data: any) {
        try {
            // Check for generic titles
            if (this.isGenericTitle(data.title)) {
                this.logger.verbose(`Skipping generic gallery title: ${data.title}`);
                return false;
            }

            // Check for duplicate by original_url
            if (data.original_url) {
                const existing = await this.prisma.photoGallery.findFirst({
                    where: { original_url: data.original_url }
                });
                if (existing) {
                    this.logger.verbose(`Skipping existing gallery: ${data.title}`);
                    return false;
                }
            }

            // DHA Specific: If a video with same title exists, delete it (Gallery wins)
            if (data.source === 'DHA') {
                const videoExists = await this.prisma.video.findFirst({
                    where: { title: data.title, source: 'DHA' }
                });
                if (videoExists) {
                    await this.prisma.video.delete({ where: { id: videoExists.id } });
                    this.logger.log(`Deleted duplicate DHA video in favor of gallery: ${data.title}`);
                }
            }

            // Check if source is active
            const settings = await this.prisma.botSetting.findUnique({
                where: { source_name: data.source }
            });
            if (settings && !settings.is_active) {
                this.logger.verbose(`Source ${data.source} is inactive, skipping gallery.`);
                return false;
            }

            const slug = data.slug || this.slugify(data.title);

            // 3.5 AI Rewrite if enabled
            let finalTitle = data.title;
            let finalDescription = data.description || '';
            let aiModel: string | null = null;
            let author = data.author || data.source;
            let seoTitle = data.title;
            let seoDescription = data.description
                ? data.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 160)
                : '';
            let seoKeywords = this.generateKeywords(data.title);

            if (settings && settings.use_ai_rewrite) {
                this.logger.log(`AI Rewrite is active for Gallery from ${data.source}. Attempting rewrite...`);
                const rewritten = await this.aiService.rewriteVisualContent(data.title, data.description || '');
                if (rewritten) {
                    finalTitle = rewritten.title;
                    finalDescription = rewritten.description;
                    seoKeywords = rewritten.seo_keywords;
                    author = 'Yapay Zeka Editörü';
                    aiModel = rewritten.model;
                    this.logger.log(`AI Rewrite SUCCESS for gallery: ${finalTitle} (${aiModel})`);
                } else {
                    this.logger.warn(`AI Rewrite FAILED or SKIPPED for gallery: ${data.title}`);
                }
                await new Promise(resolve => setTimeout(resolve, 4500));
            }

            const createdGallery = await this.prisma.photoGallery.create({
                data: {
                    title: finalTitle,
                    slug,
                    description: finalDescription,
                    thumbnail_url: await this.downloadImage(data.thumbnail_url, data.source, 'gallery'),
                    source: data.source,
                    author: author,
                    ai_model: aiModel,
                    original_url: data.original_url,
                    published_at: new Date(),
                    seo_title: seoTitle,
                    seo_description: seoDescription,
                    seo_keywords: seoKeywords,
                    gallery_images: {
                        create: data.images ? await Promise.all(data.images.map(async (img: any, index: number) => ({
                            image_url: await this.downloadImage(img.url, data.source, 'gallery_item'),
                            caption: img.caption || '',
                            media_type: img.media_type || 'image',
                            video_url: img.video_url || null,
                            order_index: index
                        }))) : []
                    }
                }
            });

            // 3.6 Tags
            if (seoKeywords) {
                const tagIds = await this.getOrCreateTags(seoKeywords);
                await this.syncGalleryTags(createdGallery.id, tagIds);
            }

            this.logger.log(`Successfully saved gallery: ${finalTitle} (Source: ${data.source})`);
            return true;
        } catch (error) {
            this.logger.error(`Error saving gallery [${data.title}] from ${data.source}: ${error.message}`);
            return false;
        }
    }

    async saveNews(newsItem: any): Promise<boolean> {
        try {
            // Check for generic titles
            if (this.isGenericTitle(newsItem.title)) {
                this.logger.verbose(`Skipping generic news title: ${newsItem.title}`);
                return false;
            }
            // 1. Check existence
            const existing = await this.prisma.news.findFirst({
                where: { original_url: newsItem.original_url },
            });

            if (existing) {
                this.logger.debug(`News already exists (Original URL: ${newsItem.original_url})`);
                // ... update logic ...
                // Update missing content AND missing image_url
                const needsContentUpdate = (!existing.content || existing.content.length < 400) && (newsItem.content && newsItem.content.length > 400);
                const needsImageUpdate = !existing.image_url && newsItem.image_url;
                if (needsContentUpdate || needsImageUpdate) {
                    this.logger.log(`Updating existing news item: ${existing.id} (Title: ${newsItem.title.substring(0, 50)}...)`);
                    
                    let localImageUrl = existing.image_url;
                    if (needsImageUpdate && newsItem.image_url) {
                        localImageUrl = await this.downloadImage(newsItem.image_url, newsItem.source, 'news_update');
                    }

                    await this.prisma.news.update({
                        where: { id: existing.id },
                        data: {
                            ...(needsContentUpdate ? { content: newsItem.content, summary: newsItem.summary } : {}),
                            image_url: localImageUrl,
                        }
                    });
                    this.logger.log(`Successfully updated existing news item: ${existing.id}`);
                    return true;
                }
                return false;
            }

            // 2. Get Settings
            const settings = await this.prisma.botSetting.findUnique({
                where: { source_name: newsItem.source },
            });

            if (settings && !settings.is_active) return false;
            const shouldPublish = settings ? settings.auto_publish : false;

            // 3. Category ID
            const category = await this.prisma.category.findUnique({
                where: { slug: newsItem.category },
            });
            const categoryId = category ? category.id : null;

            // 3.5 AI Rewrite if enabled
            if (settings && settings.use_ai_rewrite) {
                this.logger.log(`AI Rewrite is active for ${newsItem.source}. Attempting rewrite...`);
                const rewritten = await this.aiService.rewriteNews(newsItem.title, newsItem.summary, newsItem.content);
                if (rewritten) {
                    newsItem.title = rewritten.title;
                    newsItem.summary = rewritten.summary;
                    newsItem.content = rewritten.content;
                    newsItem.author = 'Yapay Zeka Editörü';
                    (newsItem as any).ai_model = rewritten.model;
                    this.logger.log(`AI Rewrite SUCCESS for: ${newsItem.title} (${rewritten.model})`);
                } else {
                    this.logger.warn(`AI Rewrite FAILED or SKIPPED for: ${newsItem.title}`);
                }
                // Central delay to respect AI RPM limits (Gemini free is 15 RPM ~ 1 per 4s)
                await new Promise(resolve => setTimeout(resolve, 4500));
            }

            // Clean up messy HTML content if AI didn't rewrite it
            if (newsItem.author !== 'Yapay Zeka Editörü' && newsItem.content) {
                newsItem.content = newsItem.content
                    .replace(/\s(style|class)="[^"]*"/gi, '') // Remove inline styles and classes
                    .replace(/<div[^>]*>/gi, '<p>')          // Convert divs to p
                    .replace(/<\/div>/gi, '</p>')
                    .replace(/<span[^>]*>/gi, '')           // Remove spans
                    .replace(/<\/span>/gi, '')
                    .replace(/<p>\s*<\/p>/gi, '')           // Remove empty p tags
                    .trim();
            }

            // 3.6 Add Source Attribution Footer
            const sourceFooter = this.getSourceFooterHtml(newsItem.source);
            if (sourceFooter) {
                newsItem.content = (newsItem.content || '') + sourceFooter;
            }

            // 4. Slug
            const slug = this.slugify(newsItem.title);

            // 5. SEO Pre-processing
            const seoDescription = newsItem.summary
                ? newsItem.summary.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 160)
                : '';
            const seoKeywords = this.generateKeywords(newsItem.title);

            // 6. Insert
            const createdNews = await this.prisma.news.create({
                data: {
                    title: newsItem.title,
                    slug: slug,
                    summary: newsItem.summary,
                    content: newsItem.content,
                    image_url: await this.downloadImage(newsItem.image_url, newsItem.source, 'news'),
                    category: newsItem.category,
                    category_id: categoryId,
                    original_url: newsItem.original_url,
                    source: newsItem.source,
                    author: newsItem.author,
                    published_at: shouldPublish ? new Date() : null,
                    is_active: true,
                    is_slider: false,
                    seo_title: newsItem.title,
                    seo_description: seoDescription,
                    seo_keywords: seoKeywords,
                    ai_model: (newsItem as any).ai_model || null,
                },
            });

            await this.activityLogsService.create({
                action_type: 'CREATE',
                entity_type: 'NEWS',
                entity_id: createdNews.id,
                description: `Haber botu tarafından eklendi: ${newsItem.title} (Kaynak: ${newsItem.source})`
            }).catch(() => { });

            // 6.5 Tags
            if (seoKeywords) {
                const tagIds = await this.getOrCreateTags(seoKeywords);
                await this.syncNewsTags(createdNews.id, tagIds);
            }

            return true;
        } catch (e) {
            if (e.code === 'P2002') return false; // Unique constraint
            this.logger.error(`Error saving news: ${e.message}`);
            return false;
        }
    }

    private getSourceFooterHtml(source: string): string {
        const agencies = {
            'AA': 'Anadolu Ajansı',
            'IHA': 'İhlas Haber Ajansı',
            'DHA': 'Demirören Haber Ajansı'
        };

        const agencyName = agencies[source.toUpperCase()];
        if (!agencyName) return '';

        return `
            <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f0f0f0; clear: both;">
                <p style="font-size: 0.7rem; font-style: italic; color: #888;">
                    Bu haber ${agencyName}'dan alınmıştır.
                </p>
            </div>
        `;
    }

    private generateKeywords(title: string): string {
        if (!title) return '';
        const cleanTitle = title.replace(/[^\w\s-çğıöşüÇĞİÖŞÜ]/g, ' ').replace(/\s+/g, ' ').trim();
        const words = cleanTitle.split(' ');
        const filteredWords = words.filter(word => word.length > 3);
        return Array.from(new Set(filteredWords)).join(', ');
    }

    private slugify(text: string, withRandom: boolean = true) {
        let slug = text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');

        if (withRandom) {
            slug += '-' + Math.floor(Math.random() * 1000);
        }
        return slug;
    }

    public isGenericTitle(title: string): boolean {
        if (!title) return true;
        const genericTitles = [
            'Video', 'VIDEO', 'video',
            'Video Galeri', 'VIDEO GALERİ', 'video galeri',
            'Haber', 'HABER', 'haber',
            'Foto Galeri Haberleri', 'FOTO GALERİ HABERLERİ', 'foto galeri haberleri',
            'Foto Galeri', 'FOTO GALERİ', 'foto galeri'
        ];
        return genericTitles.includes(title.trim());
    }

    private async getOrCreateTags(keywords: string): Promise<number[]> {
        if (!keywords) return [];
        const tagNames = keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        const tagIds: number[] = [];

        for (const name of tagNames) {
            const slug = this.slugify(name, false);
            const tag = await this.prisma.tag.upsert({
                where: { slug },
                update: {},
                create: { name, slug }
            });
            tagIds.push(tag.id);
        }
        return tagIds;
    }

    private async syncNewsTags(newsId: number, tagIds: number[]) {
        for (const tagId of tagIds) {
            await this.prisma.newsTag.upsert({
                where: { news_id_tag_id: { news_id: newsId, tag_id: tagId } },
                update: {},
                create: { news_id: newsId, tag_id: tagId }
            });
        }
    }

    private async syncVideoTags(videoId: number, tagIds: number[]) {
        for (const tagId of tagIds) {
            await this.prisma.videoTag.upsert({
                where: { video_id_tag_id: { video_id: videoId, tag_id: tagId } },
                update: {},
                create: { video_id: videoId, tag_id: tagId }
            });
        }
    }

    private async syncGalleryTags(galleryId: number, tagIds: number[]) {
        for (const tagId of tagIds) {
            await this.prisma.photoGalleryTag.upsert({
                where: { gallery_id_tag_id: { gallery_id: galleryId, tag_id: tagId } },
                update: {},
                create: { gallery_id: galleryId, tag_id: tagId }
            });
        }
    }
}
