const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
    // The article from the screenshot: Eskişehir badminton
    const search = await axios.get('https://www.iha.com.tr', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $home = cheerio.load(search.data);

    // Find the badminton article URL
    let badmintonUrl = null;
    $home('a').each((i, el) => {
        const href = $home(el).attr('href') || '';
        if (href.includes('badminton') || href.includes('eskisehir')) {
            badmintonUrl = href.startsWith('http') ? href : 'https://www.iha.com.tr' + href;
        }
    });

    if (!badmintonUrl) {
        // Try direct search
        console.log("Not found on homepage, trying search page...");
        const r2 = await axios.get('https://www.iha.com.tr/spor', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $s = cheerio.load(r2.data);
        $s('a[href*="badminton"]').each((i, el) => {
            const href = $s(el).attr('href');
            if (href && !badmintonUrl) badmintonUrl = href.startsWith('http') ? href : 'https://www.iha.com.tr' + href;
        });
    }

    console.log("Testing URL:", badmintonUrl || 'NOT FOUND');

    if (badmintonUrl) {
        const r = await axios.get(badmintonUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(r.data);
        const desc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
        console.log("META DESCRIPTION (full):", desc);
        console.log("META DESCRIPTION LENGTH:", desc.length);
    }
}
test().catch(console.error);
