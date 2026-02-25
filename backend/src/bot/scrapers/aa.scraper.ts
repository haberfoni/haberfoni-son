import { BotService } from '../bot.service';
import * as cheerio from 'cheerio';
import axios from 'axios';
import * as Parser from 'rss-parser';

const parser = new Parser.default();

// Images that should never appear in articles
const BLOCKED_IMAGE_PATTERNS = [
    'bip.png', 'bip.jpg',
    'next-header-aa', 'aa-logo',
    'default.jpg', 'placeholder',
    'logo.png', 'logo.jpg', 'logo.svg',
    'noimage', 'no-image', 'no_image',
];

function isBlockedImage(url: string | null | undefined): boolean {
    if (!url) return true;
    const lower = url.toLowerCase();
    return BLOCKED_IMAGE_PATTERNS.some(p => lower.includes(p));
}

export async function scrapeAA(bot: BotService) {
    console.log('--- Starting AA Scrape ---');
    try {
        const mappings = await bot.getBotMappings('AA');
        if (!mappings || mappings.length === 0) {
            console.log('--- AA Scrape Skipped (No mappings) ---');
            return;
        }

        let totalSaved = 0;

        for (const mapping of mappings) {
            console.log(`Fetching AA: ${mapping.source_url} -> ${mapping.target_category}`);
            try {
                let count = 0;
                if (mapping.source_url.includes('/rss/')) {
                    // RSS Logic
                    const feed = await parser.parseURL(mapping.source_url);
                    for (const item of feed.items) {
                        let imageUrl: string | null = null;
                        if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
                            imageUrl = item.enclosure.url;
                        }

                        // Fallback: Scrape from Article Page if no image in RSS
                        if (!imageUrl && item.link) {
                            try {
                                const { data: articleHtml } = await axios.get(item.link, { timeout: 30000 });
                                const $ = cheerio.load(articleHtml);
                                imageUrl = $('meta[property="og:image"]').attr('content') ||
                                    $('meta[name="twitter:image"]').attr('content') ||
                                    null;
                            } catch (err) {
                                console.error(`Failed to scrape image from ${item.link}: ${err.message}`);
                            }
                        }
                        const newsItem = {
                            title: item.title,
                            summary: item.contentSnippet?.substring(0, 200) || '',
                            content: item.content || item.contentSnippet,
                            original_url: item.link,
                            image_url: imageUrl,
                            source: 'AA',
                            category: mapping.target_category,
                            keywords: ''
                        };
                        if (await bot.saveNews(newsItem)) count++;
                    }
                } else {
                    // HTML Logic
                    count = await scrapeAAHTML(mapping.source_url, mapping.target_category, bot);
                }

                console.log(`   Saved ${count} items for ${mapping.target_category}`);
                totalSaved += count;
                await bot.updateMappingStatus(mapping.source_url, 'Success', count);

            } catch (err) {
                console.error(`Error scraping AA mapping ${mapping.source_url}:`, err.message);
                await bot.updateMappingStatus(mapping.source_url, 'Failed', 0);
            }
        }
    } catch (error) {
        console.error('Error in AA Scraper:', error);
    }
}

async function scrapeAAHTML(url: string, targetCategory: string, bot: BotService): Promise<number> {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 30000 // 30s timeout
        });
        const $ = cheerio.load(response.data);
        const articleLinks = new Set<string>();

        $('a[href*="/tr/"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && href.match(/\/tr\/[^\/]+\/[^\/]+\/\d+$/)) {
                const isMediaContent = /\/(pgc|vgc|info\/infographic)\//.test(href) || /\/(fotoraf|video|infografik)-\d+$/.test(href);
                if (!isMediaContent) {
                    const fullUrl = href.startsWith('http') ? href : `https://www.aa.com.tr${href}`;
                    articleLinks.add(fullUrl);
                }
            }
        });

        let count = 0;
        const linksArray = Array.from(articleLinks).slice(0, 10);
        for (const articleUrl of linksArray) {
            try {
                const article = await scrapeAAArticle(articleUrl, targetCategory);
                if (article) {
                    if (await bot.saveNews(article)) count++;
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`  Error scraping article ${articleUrl}:`, err.message);
            }
        }
        return count;
    } catch (err) {
        console.error(`Error fetching HTML ${url}:`, err.message);
        return 0;
    }
}

async function scrapeAAArticle(url: string, targetCategory: string) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000 // 30s timeout
        });
        const $ = cheerio.load(response.data);

        const title = $('h1').first().text().trim() || $('title').text().trim();
        if (!title) return null;

        const summaryRaw = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
        const summary = summaryRaw.replace(/\s+/g, ' ').trim();
        const imageUrlRaw = $('meta[property="og:image"]').attr('content') || $('article img').first().attr('src') || null;
        const imageUrl = isBlockedImage(imageUrlRaw) ? null : imageUrlRaw;

        let contentEl = $('.detay-icerik');
        if (contentEl.length === 0) contentEl = $('article');

        // Strip only ads/share/tag junk — keep iframe and video!
        contentEl.find('script, style, .ad, .share, .tags, .related').remove();

        let content = '';
        if (contentEl.length > 0) {
            content = contentEl.find('p, h2, h3, h4, img, figure, iframe, video').map((i, el) => {
                const $el = $(el);
                const tag = el.tagName.toLowerCase();
                const text = $el.text().trim();
                if (/^[A-Za-zÇĞİÖŞÜçğıöşü\s]{2,50}\s?\|\s?\d{2}\.\d{2}\.\d{4}/.test(text)) return '';

                if (tag === 'img' || tag === 'figure') {
                    let img = tag === 'img' ? $el : $el.find('img');
                    let src = img.attr('src') || img.attr('data-src');
                    if (src) {
                        try { src = decodeURIComponent(src); } catch (e) { }
                        if (src.startsWith('/')) src = `https://www.aa.com.tr${src}`;
                        if (src.length > 10 && !isBlockedImage(src)) {
                            return `<figure class="my-6"><img src="${src}" class="w-full h-auto rounded-lg" /></figure>`;
                        }
                    }
                    return '';
                }

                // Handle iframes (YouTube, etc.)
                if (tag === 'iframe') {
                    const src = $el.attr('src') || '';
                    if (src && (src.includes('youtube') || src.includes('youtu.be') || src.includes('dailymotion') || src.includes('vimeo'))) {
                        return `<div class="my-6 aspect-video"><iframe src="${src}" class="w-full h-full rounded-lg" allowfullscreen></iframe></div>`;
                    }
                    return '';
                }

                // Handle native video
                if (tag === 'video') {
                    const src = $el.attr('src') || $el.find('source').attr('src') || '';
                    if (src && src.startsWith('http')) {
                        return `<div class="my-6"><video src="${src}" controls class="w-full rounded-lg"></video></div>`;
                    }
                    return '';
                }
                if (tag.startsWith('h')) return `<h3>${$el.html()}</h3>`;
                return `<p>${$el.html()}</p>`;
            }).get().join('');
        }
        content = content.replace(/<p>\s*<\/p>/g, '');

        let author = $('meta[name="author"]').attr('content') || '';
        if (!author) {
            const match = $('body').text().match(/([A-Za-zÇĞİÖŞÜçğıöşü\s]{2,50})\s+\|\s+\d{2}\.\d{2}\.\d{4}/);
            if (match) author = match[1].trim();
        }

        return {
            title, summary, content, original_url: url, image_url: imageUrl, source: 'AA', author, category: targetCategory, keywords: ''
        };
    } catch (e) {
        throw new Error(e.message);
    }
}
