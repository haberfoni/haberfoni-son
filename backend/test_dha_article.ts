
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testDHAArticle() {
    const url = 'https://www.dha.com.tr/ekonomi/ayni-yemek-icin-farkli-prim-uygulamasi-onemli-sonuclar-dogurabilir-2831452';
    console.log(`Testing DHA Article Scraping for: ${url}`);
    
    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });
        const $detail = cheerio.load(response.data);
        
        let summary = $detail('h2').first().text().trim() ||
            $detail('.spot').text().trim() ||
            $detail('.news-detail-spot').text().trim() ||
            $detail('.description').text().trim();
            
        console.log(`Extracted Summary: ${summary.substring(0, 50)}...`);

        let contentEl = $detail('.news-detail-text');
        if (contentEl.length === 0) contentEl = $detail('.nd-article-content');
        if (contentEl.length === 0) contentEl = $detail('.content-text');
        
        console.log(`Content elements found: ${contentEl.length}`);
        
        let content = contentEl.text().trim();
        console.log(`Extracted Content Length: ${content.length}`);
        console.log(`Content Preview: ${content.substring(0, 100)}...`);

        if (content.length < 200) {
            console.log('--- WARNING: Content too short! ---');
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testDHAArticle();
