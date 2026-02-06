
import axios from 'axios';
import * as cheerio from 'cheerio';

async function diagnose() {
    console.log('--- DIAGNOSTIC START ---');
    await checkURL('DHA', 'https://www.dha.com.tr/spor');
    await checkURL('IHA', 'https://www.iha.com.tr/kultur-sanat');
    console.log('--- DIAGNOSTIC END ---');
}

async function checkURL(source, url) {
    console.log(`\n\nChecking ${source}: ${url}`);
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.data);

        let items = [];

        if (source === 'DHA') {
            $('a').each((i, el) => {
                const link = $(el).attr('href');
                const title = $(el).attr('title') || $(el).text().trim();
                if (link && title && title.length > 20 && !link.includes('video') && !link.includes('galeri')) {
                    const fullLink = link.startsWith('http') ? link : `https://www.dha.com.tr${link}`;
                    items.push({ title, link: fullLink });
                }
            });
        } else if (source === 'IHA') {
            const selector = '.widget_General_Category_Dashboard a, .widget_General_Category_TopFive a, .widget_General_Category_All a';
            $(selector).each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && (href.includes('/haber-') || href.match(/-[\d]+\/?$/))) {
                    const fullLink = href.startsWith('http') ? href : `https://www.iha.com.tr${href}`;
                    const title = $(elem).text().trim() || $(elem).attr('title') || "No Title";
                    items.push({ title, link: fullLink });
                }
            });
        }

        // De-duplicate
        items = [...new Map(items.map(item => [item.link, item])).values()].slice(0, 15);

        console.log(`Found ${items.length} items:`);
        items.forEach((item, index) => {
            console.log(`${index + 1}. [${item.title.substring(0, 50)}...] (${item.link})`);
        });

    } catch (error) {
        console.error(`FAILED to fetch ${url}:`, error.message);
    }
}

diagnose();
