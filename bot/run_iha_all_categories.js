
import { scrapeIHAHTML } from './src/scrapers/iha.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const mappings = [
    { source_url: 'https://www.iha.com.tr/gundem', target_category_slug: 'gundem' },
    { source_url: 'https://www.iha.com.tr/ekonomi', target_category_slug: 'ekonomi' },
    // Skip spor if regex is problematic, but let's try it
    { source_url: 'https://www.iha.com.tr/spor', target_category_slug: 'spor' },
    { source_url: 'https://www.iha.com.tr/politika', target_category_slug: 'siyaset' },
    { source_url: 'https://www.iha.com.tr/dunya', target_category_slug: 'dunya' },
    { source_url: 'https://www.iha.com.tr/magazin', target_category_slug: 'magazin' },
    { source_url: 'https://www.iha.com.tr/teknoloji', target_category_slug: 'teknoloji' },
    { source_url: 'https://www.iha.com.tr/saglik', target_category_slug: 'saglik' },
    { source_url: 'https://www.iha.com.tr/kultur-sanat', target_category_slug: 'kultur-sanat' },
    { source_url: 'https://www.iha.com.tr/yerel-haberler', target_category_slug: 'gundem' } // Maybe too broad?
];

async function runAll() {
    console.log('--- Starting Manual IHA Scrape (All Categories) ---');
    let total = 0;

    for (const m of mappings) {
        console.log(`\nCategory: ${m.target_category_slug} (URL: ${m.source_url})`);
        try {
            const count = await scrapeIHAHTML(m.source_url, m.target_category_slug);
            total += count;
            console.log(`  Saved: ${count}`);
        } catch (e) {
            console.error(`  Failed: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 2000)); // Be gentle
    }

    console.log(`\n--- Finished. Total Scraped: ${total} ---`);
    process.exit(0);
}

runAll();
