
const axios = require('axios');
const cheerio = require('cheerio');

async function testAA() {
    const url = 'https://www.aa.com.tr/tr/dunya';
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 30000
        });
        const $ = cheerio.load(response.data);
        
        console.log('--- AA Page Content ---');
        console.log('Title:', $('title').text());
        
        const selectors = [
            '.category-news-list a', 
            '.list-news-item a', 
            '.news-list-item a',
            'main a',
            'article a',
            '.col-md-4 a'
        ];
        
        selectors.forEach(sel => {
            const count = $(sel).length;
            console.log(`Selector "${sel}" found ${count} elements`);
            if (count > 0) {
                 $(sel).slice(0, 3).each((i, el) => {
                     console.log(`  - Sample: ${$(el).attr('href')}`);
                 });
            }
        });

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testAA();
