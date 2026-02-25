const axios = require('axios');
const cheerio = require('cheerio');

const BLOCKED = ['bip.png', 'bip.jpg', 'next-header-aa', 'aa-logo', 'default.jpg', 'placeholder', 'logo.png', 'logo.jpg', 'logo.svg', 'noimage', 'no-image', 'no_image'];
function isBlocked(url) { if (!url) return true; const l = url.toLowerCase(); return BLOCKED.some(p => l.includes(p)); }

async function test() {
    const home = await axios.get('https://www.iha.com.tr', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $home = cheerio.load(home.data);
    let url = $home('a[href*="/haber-"]').first().attr('href');
    if (!url.startsWith('http')) url = 'https://www.iha.com.tr' + url;
    console.log("Article URL:", url);

    const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(r.data);

    const ogImage = $('meta[property="og:image"]').attr('content');
    const galleryImg = $('div.gallery-img img').first().attr('src');
    const figureImg = $('figure img').first().attr('src');
    const articleImg = $('article img').first().attr('src');

    console.log("og:image =>", ogImage);
    console.log("gallery-img =>", galleryImg);
    console.log("figure img =>", figureImg);
    console.log("article img =>", articleImg);

    // Check what the selector finds
    const candidates = [ogImage, galleryImg, figureImg, articleImg];
    let chosen = null;
    for (const c of candidates) {
        if (c && !isBlocked(c)) { chosen = c.startsWith('http') ? c : 'https://www.iha.com.tr' + c; break; }
    }
    console.log("CHOSEN IMAGE:", chosen);
}
test().catch(console.error);
