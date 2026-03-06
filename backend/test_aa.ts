
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testAA() {
    const url = 'https://www.aa.com.tr/tr/dunya';
    console.log(`Testing AA Link Discovery for: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        const $ = cheerio.load(response.data);
        
        let selector = '.category-news-list a, .list-news-item a, .news-list-item a, main a, article a';
        console.log(`Initial selector: ${selector}`);
        let elements = $(selector);
        console.log(`Found ${elements.length} elements with initial selector.`);
        
        if (elements.length === 0) {
            console.log('Falling back to "a[href*=\\"/tr/\\"]" selector');
            selector = 'a[href*="/tr/"]';
            elements = $(selector);
        }

        const candidateLinks: string[] = [];
        elements.each((i, elem) => {
            const href = $(elem).attr('href');
            if (href) {
                // Match standard news, gallery or video patterns
                if (href.match(/\/tr\/[^\/]+\/[^\/]+\/\d+$/)) {
                    const fullUrl = href.startsWith('http') ? href : `https://www.aa.com.tr${href}`;
                    candidateLinks.push(fullUrl);
                }
            }
        });

        const unique = [...new Set(candidateLinks)];
        console.log(`Discovered ${unique.length} unique candidate links.`);
        unique.slice(0, 5).forEach(c => console.log(` - ${c}`));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testAA();
