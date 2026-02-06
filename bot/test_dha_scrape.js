import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScrape() {
    const url = 'https://www.dha.com.tr/spor';
    console.log(`Fetching ${url}...`);

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
        });

        const $ = cheerio.load(response.data);
        let found = 0;

        console.log('Page title:', $('title').text());

        const candidates = [];
        $('a').each((i, el) => {
            const link = $(el).attr('href');
            const title = $(el).attr('title') || $(el).text().trim();

            if (link && title && title.length > 20 && !link.includes('video') && !link.includes('galeri')) {
                // Fix relative URLs
                const fullLink = link.startsWith('http') ? link : `https://www.dha.com.tr${link}`;
                candidates.push(fullLink);
                found++;
            }
        });

        console.log(`Total valid article candidates found: ${found}`);

        // Try to fetch one detail page to verify selectors
        if (candidates.length > 0) {
            // Find a sport link if possible
            const detailUrl = candidates.find(c => c.includes('/spor/')) || candidates[0];

            console.log(`\nFetching detail page: ${detailUrl}`);
            const detailRes = await axios.get(detailUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $detail = cheerio.load(detailRes.data);

            const s1 = $detail('.news-detail-text').text().trim().substring(0, 100);
            const s2 = $detail('.content-text').text().trim().substring(0, 100);
            const s3 = $detail('article').text().trim().substring(0, 100);




            console.log('Selector .news-detail-text:', s1 ? `Found: "${s1}..."` : 'Empty');
            console.log('Selector .content-text:', s2 ? `Found: "${s2}..."` : 'Empty');
            console.log('Selector article:', s3 ? `Found: "${s3}..."` : 'Empty');

            const pText = $detail('article p').text().trim().substring(0, 100);
            console.log('Selector article p:', pText ? `Found: "${pText}..."` : 'Empty');

            console.log('\n--- Article Children Inspection ---');
            const children = $detail('article').children();
            children.each((i, el) => {
                console.log(`Child ${i}: <${el.tagName}> Class: "${$(el).attr('class')}" id: "${$(el).attr('id')}"`);
            });
            console.log('-----------------------------------\n');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testScrape();
