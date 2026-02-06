import { saveNews } from '../db.js';
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const parser = new Parser();

/**
 * Scrapes an AA HTML category page (e.g., https://www.aa.com.tr/tr/gundem)
 */
async function scrapeAAHTML(url, targetCategory) {
    try {
        console.log(`  Scraping HTML page: ${url}`);

        // Fetch the category page
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const articleLinks = new Set();

        // Extract article links from the page
        // AA uses links in format: /tr/gundem/article-title/article-id
        $('a[href*="/tr/"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && href.match(/\/tr\/[^\/]+\/[^\/]+\/\d+$/)) {
                // Make absolute URL
                const fullUrl = href.startsWith('http') ? href : `https://www.aa.com.tr${href}`;
                articleLinks.add(fullUrl);
            }
        });

        console.log(`  Found ${articleLinks.size} article links`);

        let count = 0;
        // Limit to first 10 articles to avoid overload
        const linksArray = Array.from(articleLinks).slice(0, 10);

        for (const articleUrl of linksArray) {
            try {
                const article = await scrapeAAArticle(articleUrl, targetCategory);
                if (article) {
                    const success = await saveNews(article);
                    if (success) count++;
                }
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`  Error scraping article ${articleUrl}:`, err.message);
            }
        }

        return count;
    } catch (error) {
        console.error(`  Error fetching HTML page ${url}:`, error.message);
        return 0;
    }
}

/**
 * Scrapes a single AA article page
 */
async function scrapeAAArticle(url, targetCategory) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);

        // Extract title
        const title = $('h1').first().text().trim() ||
            $('meta[property="og:title"]').attr('content') ||
            $('title').text().trim();

        if (!title) return null;

        // Extract description/summary
        const summaryRaw = $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            '';
        const summary = summaryRaw.replace(/\s+/g, ' ').trim();

        // Extract image
        const imageUrl = $('meta[property="og:image"]').attr('content') ||
            $('article img').first().attr('src') ||
            null;


        // Extract content - try to find article body
        let content = '';
        const articleBody = $('.detay-spot-category').text().trim() ||
            $('article p').map((i, el) => $(el).text()).get().join(' ') ||
            summary;
        content = articleBody.replace(/\s+/g, ' ').trim().substring(0, 3000); // Limit content length

        // Extract Author (Try specific class first, then regex at end of content)
        let author = $('meta[name="author"]').attr('content') || '';

        if (!author) {
            // Check for "Name Surname | Date" pattern at the end of content
            // Example: "Okan Coşkun | 05.02.2026"
            const authorDateRegex = /([A-Za-zÇĞİÖŞÜçğıöşü\s]{2,50})\s+\|\s+\d{2}\.\d{2}\.\d{4}/;
            const match = content.match(authorDateRegex);
            if (match && match[1]) {
                author = match[1].trim();
                // Optionally remove this footer from content if desired, but user might want it kept.
                // keeping it for now to be safe.

                // If the author name seems too long or contains "Güncelleme", might be false positive, but regex checks for | Date
            }
        }

        return {
            title: title,
            summary: summary.substring(0, 200),
            content: content || summary,
            original_url: url,
            image_url: imageUrl,
            source: 'AA',
            author: author, // Add extracted author
            category: targetCategory,
            keywords: ''
        };
    } catch (error) {
        throw new Error(`Failed to scrape article: ${error.message}`);
    }
}

/**
 * Main AA scraper - supports both RSS and HTML
 */
export async function scrapeAA() {
    console.log('--- Starting AA Scrape ---');
    try {
        const mappingsModule = await import('../db.js');
        const mappings = await mappingsModule.getBotMappings('AA');
        const { updateBotMappingStatus } = mappingsModule;

        if (!mappings || mappings.length === 0) {
            console.log('--- AA Scrape Skipped (No mappings) ---');
            return;
        }

        let totalSaved = 0;

        for (const mapping of mappings) {
            console.log(`Fetching AA: ${mapping.source_url} -> ${mapping.target_category_slug}`);

            try {
                let count = 0;

                // Check if URL is RSS or HTML
                if (mapping.source_url.includes('/rss/')) {
                    // RSS scraping
                    const feed = await parser.parseURL(mapping.source_url);

                    for (const item of feed.items) {
                        let imageUrl = null;
                        if (item.enclosure && item.enclosure.url && item.enclosure.type.startsWith('image')) {
                            imageUrl = item.enclosure.url;
                        }

                        const newsItem = {
                            title: item.title,
                            summary: item.contentSnippet ? item.contentSnippet.replace(/\s+/g, ' ').trim().substring(0, 200) : '',
                            content: (item.content || item.contentSnippet || '').replace(/\s+/g, ' ').trim(),
                            original_url: item.link,
                            image_url: imageUrl,
                            source: 'AA',
                            category: mapping.target_category_slug,
                            keywords: ''
                        };

                        const success = await saveNews(newsItem);
                        if (success) count++;
                    }
                } else {
                    // HTML scraping
                    count = await scrapeAAHTML(mapping.source_url, mapping.target_category_slug);
                }

                console.log(`   Saved ${count} items for ${mapping.target_category_slug}`);
                totalSaved += count;

                // Log Success
                await updateBotMappingStatus(mapping.source_url, 'Success', count);

            } catch (err) {
                console.error(`Error scraping AA mapping ${mapping.source_url}:`, err.message);
                // Log Failure
                await updateBotMappingStatus(mapping.source_url, 'Failed', 0);
            }
        }

        console.log(`--- AA Scrape Finished. Total Saved: ${totalSaved} ---`);
    } catch (error) {
        console.error('Error in AA Scraper:', error);
    }
}
