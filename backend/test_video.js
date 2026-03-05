const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function testIHA() {
    console.log("Testing IHA Video Page");
    const url = 'https://www.iha.com.tr/video';
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000, httpsAgent });
    const $ = cheerio.load(response.data);
    const articleLinks = new Set();

    let selector = '.widget_General_Category_Dashboard a, .widget_General_Category_TopFive a, .widget_General_Category_All a';
    if ($(selector).length === 0) {
        selector = '.video-category-list a, .gallery-category-list a, main a, article a';
    }

    $(selector).each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
            const isMatch = (href.includes('/video-') || href.includes('/foto-galeri-') || href.includes('/haber-') || href.match(/-[\d]+\/?$/));
            if (isMatch) {
                const fullUrl = href.startsWith('http') ? href : `https://www.iha.com.tr${href}`;
                articleLinks.add(fullUrl);
            }
        }
    });
    console.log("IHA Links found:", Array.from(articleLinks).slice(0, 5));
}

async function testDHA() {
    console.log("Testing DHA Video Page");
    const url = 'https://www.dha.com.tr/video/';
    const response = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 10000
    });
    const $ = cheerio.load(response.data);
    const articles = [];
    $('a').each((i, el) => {
        const link = $(el).attr('href');
        let title = $(el).attr('title') || $(el).text().trim();
        const imgAlt = $(el).find('img').attr('alt');
        if (!title && imgAlt) title = imgAlt.trim();

        if (link && title) {
            const isMatch = (link.includes('-video-') || link.includes('-galeri-') || link.includes('/video/') || link.includes('/foto-galeri/'));
            if (title.length > 10 && isMatch) {
                const fullLink = link.startsWith('http') ? link : `https://www.dha.com.tr${link}`;
                articles.push(fullLink);
            }
        }
    });
    console.log("DHA Links found:", articles.slice(0, 5));
}

async function run() {
    await testIHA();
    await testDHA();
}
run();
