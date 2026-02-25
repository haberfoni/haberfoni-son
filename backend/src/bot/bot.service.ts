import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { scrapeAA } from './scrapers/aa.scraper';
import { scrapeIHA } from './scrapers/iha.scraper';
import { scrapeDHA } from './scrapers/dha.scraper';

@Injectable()
export class BotService implements OnModuleInit {
    private readonly logger = new Logger(BotService.name);

    constructor(private prisma: PrismaService) { }

    async onModuleInit() {
        this.logger.log('BotService initialized');
        await this.cleanupStuckCommands();
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

    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleCron() {
        this.logger.log('Starting scheduled scrape cycle...');
        await this.scrapeAll();
    }

    async scrapeAll(commandId?: number) {
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
            await scrapeAA(this);
            await scrapeIHA(this);
            await scrapeDHA(this);

            if (cmdId) {
                await this.prisma.botCommand.update({
                    where: { id: cmdId },
                    data: { status: 'COMPLETED' }
                });
            }
            this.logger.log('Scrape cycle finished.');
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
        return this.prisma.botCategoryMapping.create({
            data
        });
    }

    async deleteMapping(id: number) {
        return this.prisma.botCategoryMapping.delete({
            where: { id }
        });
    }

    async updateMappingStatus(sourceUrl: string, status: string, count: number) {
        await this.prisma.botCategoryMapping.updateMany({
            where: { source_url: sourceUrl },
            data: {
                last_scraped_at: new Date(),
                last_status: status,
                last_item_count: count,
            },
        });
    }

    async saveNews(newsItem: any): Promise<boolean> {
        try {
            // 1. Check existence
            const existing = await this.prisma.news.findFirst({
                where: { original_url: newsItem.original_url },
            });

            if (existing) {
                // Update missing content AND missing image_url
                const needsContentUpdate = (!existing.content || existing.content.length < 400) && (newsItem.content && newsItem.content.length > 400);
                const needsImageUpdate = !existing.image_url && newsItem.image_url;
                if (needsContentUpdate || needsImageUpdate) {
                    await this.prisma.news.update({
                        where: { id: existing.id },
                        data: {
                            ...(needsContentUpdate ? { content: newsItem.content, summary: newsItem.summary } : {}),
                            ...(needsImageUpdate ? { image_url: newsItem.image_url } : {}),
                        }
                    });
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

            // 4. Slug
            const slug = this.slugify(newsItem.title);

            // 5. Insert
            await this.prisma.news.create({
                data: {
                    title: newsItem.title,
                    slug: slug,
                    summary: newsItem.summary,
                    content: newsItem.content,
                    image_url: newsItem.image_url,
                    category: newsItem.category,
                    category_id: categoryId,
                    original_url: newsItem.original_url,
                    source: newsItem.source,
                    author: newsItem.author,
                    published_at: shouldPublish ? new Date() : null,
                    is_active: true,
                    is_slider: false,
                    seo_title: newsItem.title,
                    seo_description: newsItem.summary,
                    seo_keywords: newsItem.keywords,
                },
            });

            return true;
        } catch (e) {
            if (e.code === 'P2002') return false; // Unique constraint
            this.logger.error(`Error saving news: ${e.message}`);
            return false;
        }
    }

    private slugify(text: string) {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '') + '-' + Math.floor(Math.random() * 1000);
    }
}
