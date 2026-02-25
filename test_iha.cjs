const axios = require('axios');
const cheerio = require('cheerio');

const BLOCKED_IMAGE_PATTERNS = ['bip.png', 'default.jpg', 'logo.png'];
function isBlockedImage(url) { return false; }

async function test() {
    const url = 'https://www.iha.com.tr/haber-tuzlada-isci-konteynerinde-cikan-yangin-sonduruldu-1941620';
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);

    const summaryRaw = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    let summary = summaryRaw.replace(/\s+/g, ' ').trim();
    if (summary.length > 200) summary = summary.substring(0, 197) + '...';
    console.log("SUUMMARY:", summary);

    $('script, style, .share-buttons, .tags, .related-news, .ad-banner, .breadcrumb, meta, iframe, noscript').remove();
    const contentContainers = ['.habericerik', '#habericerik', '.content-text', '[itemprop="articleBody"]', 'article .news-content', 'article'];
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
                if (text.length > 20) parts.push(`<p>${text}</p>`);
            } else if (tag.startsWith('h')) {
                const text = $el.text().trim();
                if (text) parts.push(`<h3>${text}</h3>`);
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
    console.log("CONTENT:\n", content);
}
test().catch(console.error);
