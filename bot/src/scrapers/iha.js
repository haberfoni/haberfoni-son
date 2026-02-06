import { saveNews } from '../db.js';
import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const parser = new Parser();

/**
 * Scrapes an IHA HTML category page
 */
export async function scrapeIHAHTML(url, targetCategory) {
    try {
        console.log(`  Scraping HTML page: ${url}`);
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(response.data);
        const articleLinks = new Set();

        // Target specific category widgets to avoid scraping sidebar/breaking news
        // .widget_General_Category_Dashboard: Main feature
        // .widget_General_Category_TopFive: Top 5 list
        // .widget_General_Category_All: All news list
        const selector = '.widget_General_Category_Dashboard a, .widget_General_Category_TopFive a, .widget_General_Category_All a';

        $(selector).each((i, elem) => {
            const href = $(elem).attr('href');
            // IHA specific pattern or generic news pattern
            if (href && (href.includes('/haber-') || href.match(/-[\d]+\/?$/))) {
                const fullUrl = href.startsWith('http') ? href : `https://www.iha.com.tr${href}`;
                articleLinks.add(fullUrl);
            }
        });

        console.log(`  Found ${articleLinks.size} article links`);
        let count = 0;
        const linksArray = Array.from(articleLinks).slice(0, 10);

        for (const articleUrl of linksArray) {
            try {
                const article = await scrapeIHAArticle(articleUrl, targetCategory);
                if (article) {
                    const success = await saveNews(article);
                    if (success) count++;
                }
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
 * Scrapes a single IHA article page
 */
export async function scrapeIHAArticle(url, targetCategory) {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.data);

        const title = $('h1').first().text().trim() || $('title').text().trim();
        if (!title) return null;

        const summaryRaw = $('meta[name="description"]').attr('content') || '';
        const summary = summaryRaw.replace(/\s+/g, ' ').trim();
        const imageUrl = $('meta[property="og:image"]').attr('content') || $('article img').first().attr('src') || null;

        // Content Extraction
        // IHA often uses id="content" on multiple elements (h2 and div) containing the text
        let articleBody = $('#content').text().trim() ||
            $('.content').text().trim() ||
            $('.content-text').text().trim() ||
            $('article p').text().trim() ||
            summary;
        articleBody = articleBody.replace(/\s+/g, ' ').trim();
        const content = articleBody.substring(0, 3000);

        // Author Extraction
        let author = $('meta[name="author"]').attr('content') || '';
        if (!author) {
            // Try common IHA patterns or generic Regex
            const authorDateRegex = /([A-Za-zÇĞİÖŞÜçğıöşü\s]{2,50})\s+\|\s+\d{2}\.\d{2}\.\d{4}/;
            const match = content.match(authorDateRegex);
            if (match) author = match[1].trim();
        }

        return {
            title,
            summary: summary.substring(0, 200) + ' - İhlas Haber Ajansı',
            content,
            original_url: url,
            image_url: imageUrl,
            source: 'IHA',
            author: author,
            category: targetCategory,
            keywords: ''
        };
    } catch (error) {
        throw new Error(`Failed to scrape article: ${error.message}`);
    }
}

export async function scrapeIHA() {
    console.log('--- Starting IHA Scrape ---');
    try {
        const mappingsModule = await import('../db.js');
        const mappings = await mappingsModule.getBotMappings('IHA');
        const { updateBotMappingStatus } = mappingsModule;

        if (!mappings || mappings.length === 0) {
            console.log('--- IHA Scrape Skipped (No mappings) ---');
            return;
        }

        let totalSaved = 0;

        for (const mapping of mappings) {
            console.log(`Fetching IHA: ${mapping.source_url} -> ${mapping.target_category_slug}`);

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
                            summary: item.contentSnippet ? item.contentSnippet.substring(0, 200) : '',
                            content: item.content || item.contentSnippet,
                            original_url: item.link,
                            image_url: imageUrl,
                            source: 'IHA',
                            category: mapping.target_category_slug,
                            keywords: ''
                        };

                        const success = await saveNews(newsItem);
                        if (success) count++;
                    }
                } else {
                    // HTML scraping
                    count = await scrapeIHAHTML(mapping.source_url, mapping.target_category_slug);
                }

                console.log(`   Saved ${count} items for ${mapping.target_category_slug}`);
                totalSaved += count;

                // Log Success
                await updateBotMappingStatus(mapping.source_url, 'Success', count);

            } catch (err) {
                console.error(`Error scraping IHA mapping ${mapping.source_url}:`, err.message);
                // Log Failure
                await updateBotMappingStatus(mapping.source_url, 'Failed', 0);
            }
        }
        console.log(`--- IHA Scrape Finished. Saved ${totalSaved} new items. ---`);

    } catch (error) {
        console.error('Error scraping IHA:', error);
    }
}
