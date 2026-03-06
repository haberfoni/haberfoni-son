
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testDHA() {
    const url = 'https://www.dha.com.tr/ekonomi/';
    console.log(`Testing DHA Link Discovery for: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        const $ = cheerio.load(response.data);
        
        let selector = '.nd-content-column a, .category-news-list a, .nd-news-list a, main a';
        console.log(`Initial selector: ${selector}`);
        let elements = $(selector);
        console.log(`Found ${elements.length} elements with initial selector.`);
        
        if (elements.length === 0) {
            console.log('Falling back to "a" selector');
            elements = $('a');
        }

        const candidateLinks: any[] = [];
        elements.each((i, el) => {
            const link = $(el).attr('href');
            let title = $(el).attr('title') || $(el).text().trim();
            
            if (link && title) {
                const fullLink = link.startsWith('http') ? link : `https://www.dha.com.tr${link}`;
                const isVideo = fullLink.includes('/video/') || fullLink.includes('-video-');
                const isGallery = fullLink.includes('/foto-galeri/') || fullLink.includes('-galeri-');
                const hasId = /\d+(\/)?$/.test(fullLink);
                const isNav = fullLink.includes('/etiket/') || fullLink.includes('/yazarlar/') || fullLink.includes('/kunye/');

                if (title.length > 10 && (isVideo || isGallery || hasId) && !isNav) {
                    candidateLinks.push({ title, fullLink });
                }
            }
        });

        console.log(`Discovered ${candidateLinks.length} candidate links.`);
        candidateLinks.slice(0, 5).forEach(c => console.log(` - [${c.title}] -> ${c.fullLink}`));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testDHA();
