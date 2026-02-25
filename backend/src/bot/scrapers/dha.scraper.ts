
import { BotService } from '../bot.service';
import * as cheerio from 'cheerio';
import axios from 'axios';

const BLOCKED_IMAGE_PATTERNS = [
    'bip.png', 'bip.jpg',
    'next-header-aa', 'aa-logo',
    'dha-logo', 'default.jpg',
    'placeholder', 'logo.png', 'logo.jpg', 'logo.svg',
    'noimage', 'no-image', 'no_image',
];

function isBlockedImage(url: string | null | undefined): boolean {
    if (!url) return true;
    const lower = url.toLowerCase();
    return BLOCKED_IMAGE_PATTERNS.some(p => lower.includes(p));
}

export async function scrapeDHA(bot: BotService) {
    console.log('--- Starting DHA Scrape ---');
    try {
        const mappings = await bot.getBotMappings('DHA');

        if (!mappings || mappings.length === 0) {
            console.log('--- DHA Scrape Skipped (No mappings) ---');
            return;
        }

        let totalSaved = 0;
        for (const mapping of mappings) {
            console.log(`Fetching DHA: ${mapping.source_url} -> ${mapping.target_category}`);
            try {
                const response = await axios.get(mapping.source_url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
                    timeout: 30000
                });

                const $ = cheerio.load(response.data);
                const articles: any[] = [];

                $('a').each((i, el) => {
                    const link = $(el).attr('href');
                    const title = $(el).attr('title') || $(el).text().trim();
                    const img = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');

                    // Filter valid news links
                    if (link && title && title.length > 20 && !link.includes('video') && !link.includes('galeri')) {
                        // Fix relative URLs
                        const fullLink = link.startsWith('http') ? link : `https://www.dha.com.tr${link}`;

                        articles.push({
                            title: title,
                            original_url: fullLink,
                            image_url: img && !isBlockedImage(img) ? (img.startsWith('http') ? img : `https://www.dha.com.tr${img}`) : null,
                            summary: '',
                            content: '',
                            source: 'DHA',
                            category: mapping.target_category
                        });
                    }
                });

                // Unique articles by URL
                const uniqueArticles = [...new Map(articles.map(item => [item.original_url, item])).values()].slice(0, 10); // Limit to 10 latest
                let count = 0;

                for (const item of uniqueArticles) {
                    try {
                        // Fetch detail page
                        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
                        const detailResponse = await axios.get(item.original_url, {
                            headers: { 'User-Agent': 'Mozilla/5.0' },
                            timeout: 30000
                        });
                        const $detail = cheerio.load(detailResponse.data);

                        // Extract summary (Spot) first
                        let summary = $detail('h2').first().text().trim() ||
                            $detail('.spot').text().trim() ||
                            $detail('.news-detail-spot').text().trim() ||
                            $detail('.description').text().trim();

                        // Clean up DOM before extracting content
                        $detail('script').remove();
                        $detail('style').remove();
                        $detail('.share-buttons').remove();
                        $detail('.breadcrumb').remove();
                        $detail('.tags').remove();
                        $detail('.related-news').remove();
                        $detail('.news-list').remove();
                        $detail('.slider').remove();
                        $detail('.swiper').remove();
                        $detail('.similar-news').remove();
                        $detail('.other-news').remove();
                        $detail('.most-read').remove();
                        $detail('.side-news').remove();
                        $detail('.video-gallery').remove();
                        $detail('.photo-gallery').remove();
                        $detail('.ad-banner').remove();
                        $detail('.etiketler').remove();
                        $detail('.news-tags').remove();
                        $detail('.article-tags').remove();
                        $detail('.item-tags').remove();
                        $detail('.news-detail-tags').remove();
                        $detail('h1').remove(); // Remove title from content area

                        // Remove summary/spot from content area to avoid duplication
                        if (summary) {
                            $detail('h2').filter((i, el) => $detail(el).text().trim() === summary).remove();
                            $detail('.spot').remove();
                            $detail('.news-detail-spot').remove();
                        }

                        // Try to find the specific content container
                        let contentEl = $detail('.news-detail-text');
                        if (contentEl.length === 0) contentEl = $detail('.nd-article-content');
                        if (contentEl.length === 0) contentEl = $detail('.content-text');

                        // If specific container found, get text from paragraphs and HEADERS to preserve structure
                        let content = '';
                        if (contentEl.length > 0) {
                            // Select paragraphs, headers, lists, and IMAGES
                            let stopExtraction = false;

                            let rawContent = contentEl.find('p, h2, h3, h4, ul, ol, figure, img, iframe, video').map((i, el) => {
                                if (stopExtraction) return '';

                                const tag = el.tagName.toLowerCase();
                                const $el = $detail(el);

                                // Handle Images
                                if (tag === 'img' || tag === 'figure') {
                                    if (tag === 'img' && $el.closest('figure').length > 0) return '';

                                    let imgEl = tag === 'img' ? $el : $el.find('img');
                                    let src = imgEl.attr('data-src') || imgEl.attr('src');

                                    if (src && !src.includes('base64') && !isBlockedImage(src)) {
                                        if (!src.startsWith('http')) src = `https://www.dha.com.tr${src}`;
                                        let caption = tag === 'figure' ? $el.find('figcaption').text().trim() : imgEl.attr('alt');
                                        return `<figure class="my-6"><img src="${src}" alt="${caption || ''}" class="w-full h-auto rounded-lg shadow-md" /><figcaption class="text-sm text-gray-500 mt-2 text-center">${caption || ''}</figcaption></figure>`;
                                    }
                                    return '';
                                }

                                // Handle iframes (YouTube, Dailymotion, Vimeo, etc.)
                                if (tag === 'iframe') {
                                    const src = $el.attr('src') || '';
                                    if (src && (src.includes('youtube') || src.includes('youtu.be') || src.includes('dailymotion') || src.includes('vimeo'))) {
                                        return `<div class="my-6 aspect-video"><iframe src="${src}" class="w-full h-full rounded-lg" allowfullscreen></iframe></div>`;
                                    }
                                    return '';
                                }

                                // Handle native video tags
                                if (tag === 'video') {
                                    const src = $el.attr('src') || $el.find('source').attr('src') || '';
                                    if (src && src.startsWith('http')) {
                                        return `<div class="my-6"><video src="${src}" controls class="w-full rounded-lg"></video></div>`;
                                    }
                                    return '';
                                }

                                const text = $detail(el).text().trim();
                                const upperText = text.toUpperCase();

                                if (['GÜNCEL HABERLER', 'İLGİLİ HABERLER', 'DİĞER HABERLER', 'EN ÇOK OKUNANLAR'].some(kw => upperText.includes(kw) && text.length < 50)) {
                                    stopExtraction = true;
                                    return '';
                                }

                                if (['PAYLAŞ', 'X', 'ABONE OL', 'YAZDIR', 'KAYDET', 'KIŞ'].includes(upperText)) return '';
                                if (text.length < 3 && !/^[.,!?-]$/.test(text) && !/^\d+$/.test(text)) return '';

                                const links = $detail(el).find('a');
                                if (links.length > 0) {
                                    const linkText = links.text().replace(/\s+/g, '').length;
                                    const totalTextLen = text.replace(/\s+/g, '').length;
                                    if (totalTextLen > 0 && (linkText / totalTextLen) > 0.6) return '';
                                    if (totalTextLen < 50) return '';
                                }

                                if (!text) return '';

                                if (tag === 'p') return `<p>${$detail(el).html()?.trim()}</p>`;
                                if (tag === 'h2' || tag === 'h3' || tag === 'h4') return `<h3>${text}</h3>`;
                                if (tag === 'ul') return `<ul>${$detail(el).html()?.trim()}</ul>`;
                                if (tag === 'ol') return `<ol>${$detail(el).html()?.trim()}</ol>`;
                                return `<p>${text}</p>`;
                            }).get();

                            let contentArr = rawContent;
                            while (contentArr.length > 0) {
                                const lastItem = contentArr[contentArr.length - 1];
                                const cleanLast = lastItem.replace(/<[^>]*>/g, '').trim();
                                if (cleanLast.length < 5 || ['kış', 'yaz', 'etiketler', 'paylaş', 'x'].includes(cleanLast.toLowerCase())) {
                                    contentArr.pop();
                                } else {
                                    break;
                                }
                            }
                            content = contentArr.join('');
                            if (!content) content = contentEl.html()?.trim() || '';
                        } else {
                            content = $detail('article p').map((i, el) => `<p>${$detail(el).text().trim()}</p>`).get().join('');
                        }

                        content = content.replace(/\s+/g, ' ').trim();

                        if (!summary && content.length > 50) {
                            summary = content.substring(0, 200) + '...';
                        }
                        if (!summary) summary = item.title;

                        let author = $detail('meta[name="author"]').attr('content') ||
                            $detail('.news-detail-editor-name').text().trim() ||
                            $detail('.news-source-info').text().trim();

                        if (!author) {
                            const contentText = $detail('.news-detail-text').text();
                            const match = contentText.match(/([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)*\s+[A-ZÇĞİÖŞÜ]{2,})(?=\s*\/|\s*,)/);
                            if (match) author = match[1];
                        }

                        summary = `${summary} - Demirören Haber Ajansı`;

                        const newsItem = {
                            ...item,
                            content: content,
                            summary: summary,
                            author: author,
                        };

                        const success = await bot.saveNews(newsItem);
                        if (success) count++;
                    } catch (detailErr) {
                        console.error(`Status check: Failed to scrape detail for ${item.original_url}: ${detailErr.message}`);
                        continue;
                    }
                }

                console.log(`   Saved ${count} items for ${mapping.target_category}`);
                totalSaved += count;
                await bot.updateMappingStatus(mapping.source_url, 'Success', count);

            } catch (err) {
                console.error(`Error scraping DHA mapping ${mapping.source_url}:`, err.message);
                await bot.updateMappingStatus(mapping.source_url, 'Failed', 0);
            }
        }
        console.log(`--- DHA Scrape Finished. Saved ${totalSaved} new items. ---`);
    } catch (error) {
        console.error('Error scraping DHA:', error);
    }
}
