
const axios = require('axios');
const cheerio = require('cheerio');

async function testIHA() {
    const url = 'https://www.iha.com.tr/ekonomi';
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 30000
        });
        const $ = cheerio.load(response.data);
        
        console.log('--- IHA Page Content ---');
        console.log('Title:', $('title').text());
        
        const selectors = [
            '.widget_General_Category_Dashboard a', 
            '.widget_General_Category_All a',
            'main a',
            'article a',
            'a[href*="/haber-"]'
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

testIHA();
