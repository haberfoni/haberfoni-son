const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    const home = await axios.get('https://www.iha.com.tr', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $home = cheerio.load(home.data);
    let url = $home('a[href*="/haber-"]').first().attr('href');
    if (!url.startsWith('http')) url = 'https://www.iha.com.tr' + url;

    console.log("Scraping URL:", url);

    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);

    // Remove garbage
    $('script, style, .share-buttons, .ad-banner, .breadcrumb, meta, iframe, noscript, header, footer, nav, aside').remove();

    // Find the element with the most text
    let maxTextLen = 0;
    let bestEl = null;

    $('div, article, section').each((i, el) => {
        const textLen = $(el).text().trim().length;
        if (textLen > maxTextLen && textLen < 15000) { // arbitrary cap to avoid body
            maxTextLen = textLen;
            bestEl = $(el);
        }
    });

    if (bestEl) {
        console.log("BEST CLASS:", bestEl.attr('class'));
        console.log("BEST ID:", bestEl.attr('id'));
        console.log("HTML SNIPPET:", bestEl.html().substring(0, 300));
    }
}
test().catch(console.error);
