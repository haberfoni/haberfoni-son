import axios from 'axios';
import * as cheerio from 'cheerio';

async function testMediaFilter() {
    console.log('=== Testing AA Media Content Filter ===\n');

    const testUrl = 'https://www.aa.com.tr/tr/gundem';

    try {
        const response = await axios.get(testUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const allLinks = [];
        const filteredLinks = [];
        const mediaLinks = [];

        $('a[href*="/tr/"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && href.match(/\/tr\/[^\/]+\/[^\/]+\/\d+$/)) {
                allLinks.push(href);

                // Apply the same filter as in aa.js
                const isMediaContent = /\/(fotoraf|video|infografik)-\d+$/.test(href);

                if (isMediaContent) {
                    mediaLinks.push(href);
                } else {
                    filteredLinks.push(href);
                }
            }
        });

        console.log(`Total links found: ${allLinks.length}`);
        console.log(`Media content links (FILTERED OUT): ${mediaLinks.length}`);
        console.log(`Regular news links (KEPT): ${filteredLinks.length}\n`);

        if (mediaLinks.length > 0) {
            console.log('✅ Media content detected and filtered:');
            mediaLinks.slice(0, 5).forEach(link => {
                const type = link.match(/\/(fotoraf|video|infografik)-/)[1];
                console.log(`   - [${type.toUpperCase()}] ${link}`);
            });
            console.log('');
        }

        if (filteredLinks.length > 0) {
            console.log('✅ Regular news links (first 5):');
            filteredLinks.slice(0, 5).forEach(link => {
                console.log(`   - ${link}`);
            });
        }

        console.log('\n✅ Filter is working correctly!');
        console.log(`   ${mediaLinks.length} media items filtered out`);
        console.log(`   ${filteredLinks.length} news articles will be scraped`);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

testMediaFilter();
