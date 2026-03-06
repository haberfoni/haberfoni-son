
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function testIHA() {
    const url = 'https://www.iha.com.tr/ekonomi';
    console.log(`Testing IHA Link Discovery for: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000,
            httpsAgent
        });
        const $ = cheerio.load(response.data);
        
        let selector = '.widget_General_Category_Dashboard a, .widget_General_Category_TopFive a, .widget_General_Category_All a, .widget_VideoNews_Dashboard a, .widget_VideoNews_TopFive a, .widget_VideoNews_All a';
        console.log(`Initial selector: ${selector}`);
        let elements = $(selector);
        console.log(`Found ${elements.length} elements with initial selector.`);
        
        if (elements.length === 0) {
            console.log('Falling back to "video-category-list..." selector');
            selector = '.video-category-list a, .gallery-category-list a, main a, article a';
            elements = $(selector);
            console.log(`Found ${elements.length} elements with fallback selector.`);
        }

        const candidateLinks: any[] = [];
        elements.each((i, el) => {
               const href = $(el).attr('href');
            if (href) {
                const isMatch = (href.includes('/video-') || href.includes('/foto-galeri-') || href.includes('/haber-') || href.match(/-[\d]+\/?$/));
                if (isMatch) {
                    const fullUrl = href.startsWith('http') ? href : `https://www.iha.com.tr${href}`;
                    candidateLinks.push({ href, fullUrl });
                }
            }
        });

        console.log(`Discovered ${candidateLinks.length} unique candidates (before Set: ${candidateLinks.length}).`);
        const unique = [...new Set(candidateLinks.map(c => c.fullUrl))];
        console.log(`Unique candidates: ${unique.length}`);
        unique.slice(0, 5).forEach(c => console.log(` - ${c}`));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testIHA();
