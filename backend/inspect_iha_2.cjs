const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const url = 'https://www.iha.com.tr/haber-trumptan-irana-nukleer-silaha-sahip-olmalarina-izin-vermeyecegim-1194841';
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);

    const summaryRaw = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    let summary = summaryRaw.replace(/\s+/g, ' ').trim();

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
        console.log("Found container:", contentEl.attr('class'));

        contentEl.children().each((i, el) => {
            const tag = el.tagName.toLowerCase();
            const $el = $(el);

            if (tag === 'p' || tag === 'div' || tag === 'span') {
                const text = $el.text().trim();
                console.log("Child tag:", tag, "Text length:", text.length, "Text snippet:", text.substring(0, 50));
                if (text.length > 20) {
                    parts.push(`<p>${text}</p>`);
                }
            }
        });

        if (parts.length < 2) {
            console.log("Fallback logic triggered");
            const pureText = contentEl.text().trim();
            const lines = pureText.split('\n').map(l => l.trim()).filter(l => l.length > 30);
            content = lines.map(l => `<p>${l}</p>`).join('');
        } else {
            content = parts.join('');
        }
    }

    console.log("FINAL CONTENT STARTS--");
    console.log(content.substring(0, 1000));
    console.log("FINAL CONTENT ENDS--");
}
test().catch(console.error);
