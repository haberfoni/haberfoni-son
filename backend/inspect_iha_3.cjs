const axios = require('axios');
const cheerio = require('cheerio');

const BLOCKED_IMAGE_PATTERNS = [
    'bip.png', 'bip.jpg',
    'next-header-aa', 'aa-logo',
    'default.jpg', 'placeholder',
    'logo.png', 'logo.jpg', 'logo.svg',
    'noimage', 'no-image', 'no_image',
];

function isBlockedImage(url) {
    if (!url) return true;
    const lower = url.toLowerCase();
    return BLOCKED_IMAGE_PATTERNS.some(p => lower.includes(p));
}

async function scrapeIHAArticle(url, targetCategory) {
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000 // 30s timeout
        });
        const $ = cheerio.load(response.data);

        const title = $('h1').first().text().trim() || $('title').text().trim();
        if (!title) return null;

        const summaryRaw = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
        let summary = summaryRaw.replace(/\s+/g, ' ').trim();
        if (summary.length > 200) {
            summary = summary.substring(0, 197) + '...';
        }
        // Image Extraction - skip blocked/placeholder images
        let imageUrl = null;
        const candidates = [
            $('meta[property="og:image"]').attr('content'),
            $('div.gallery-img img').first().attr('src'),
            $('figure img').first().attr('src'),
            $('.article-img img').first().attr('src'),
            $('article img').first().attr('src'),
        ];
        for (const c of candidates) {
            if (c && !isBlockedImage(c)) {
                imageUrl = c.startsWith('http') ? c : 'https://www.iha.com.tr' + c;
                break;
            }
        }

        // Content Extraction
        $('script, style, .share-buttons, .tags, .related-news, .ad-banner, .breadcrumb, meta, iframe, noscript').remove();

        const contentContainers = ['.news-detail__content', '.widget_General_News_Detail .content', '.habericerik', '#habericerik', '.content-text', '[itemprop="articleBody"]', 'article .news-content', 'article'];
        let contentEl = null;

        for (const sel of contentContainers) {
            const el = $(sel);
            if (el && el.length > 0 && el.text().trim().length > 50) {
                contentEl = el.first();
                break;
            }
        }

        let content = '';
        if (contentEl) {
            const parts = [];

            contentEl.children().each((i, el) => {
                const tag = el.tagName.toLowerCase();
                const $el = $(el);

                if (tag === 'p' || tag === 'div' || tag === 'span') {
                    const text = $el.text().trim();
                    if (text.length > 20) {
                        parts.push(`<p>${text}</p>`);
                    }
                } else if (tag.startsWith('h')) {
                    const text = $el.text().trim();
                    if (text) parts.push(`<h3>${text}</h3>`);
                } else if (tag === 'figure' || tag === 'img') {
                    const imgEl = tag === 'img' ? $el : $el.find('img');
                    let src = imgEl.attr('data-src') || imgEl.attr('src') || '';
                    if (src && !isBlockedImage(src)) {
                        if (!src.startsWith('http')) src = 'https://www.iha.com.tr' + src;
                        const alt = imgEl.attr('alt') || '';
                        parts.push(`<figure class="my-6"><img src="${src}" alt="${alt}" class="w-full h-auto rounded-lg" /></figure>`);
                    }
                }
            });

            if (parts.length < 2) {
                const pureText = contentEl.text().trim();
                const lines = pureText.split('\n').map(l => l.trim()).filter(l => l.length > 30);
                content = lines.map(l => `<p>${l}</p>`).join('');
            } else {
                content = parts.join('');
            }
        }

        if (!content || content.length < 50) {
            content = `<p>${summary}</p>`;
        }

        let author = $('meta[name="author"]').attr('content') || '';
        if (!author) {
            const authorDateRegex = /([A-Za-zÇĞİÖŞÜçğıöşü\s]{2,50})\s+\|\s+\d{2}\.\d{2}\.\d{4}/;
            const match = content.match(authorDateRegex);
            if (match) author = match[1].trim();
        }

        return {
            title,
            summary: summary,
            content,
            original_url: url,
            image_url: imageUrl,
            source: 'IHA',
            author: author,
            category: targetCategory,
        };
    } catch (error) {
        throw new Error(`Failed to scrape article: ${error.message}`);
    }
}

async function test() {
    try {
        const home = await axios.get('https://www.iha.com.tr', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $home = cheerio.load(home.data);
        const links = [];
        $home('a[href*="/haber-"]').each((i, el) => {
            let href = $home(el).attr('href');
            if (!href.startsWith('http')) href = 'https://www.iha.com.tr' + href;
            links.push(href);
        });

        console.log(`Found ${links.length} links. Testing first 2...`);
        for (let i = 0; i < Math.min(2, links.length); i++) {
            console.log(`\n--- Testing ${links[i]} ---`);
            const result = await scrapeIHAArticle(links[i], 'test-category');
            console.log("Title:", result.title);
            console.log("Summary length:", result.summary.length);
            console.log("Summary preview:", result.summary.substring(0, 100));
            console.log("Content length:", result.content.length);
            console.log("Content preview:", result.content.substring(0, 500));
        }
    } catch (e) {
        console.error(e);
    }
}

test();
