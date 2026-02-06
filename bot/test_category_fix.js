import { scrapeAA } from './src/scrapers/aa.js';
import { getCategoryIdBySlug } from './src/db.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testCategoryMapping() {
    console.log('=== Testing Category Mapping ===\n');

    // 1. Test category ID lookup
    const gundemId = await getCategoryIdBySlug('gundem');
    console.log(`1. Category ID for 'gundem': ${gundemId}\n`);

    // 2. Delete one existing AA news to test re-scraping
    console.log('2. Deleting one AA news to test re-scraping...');
    const { data: oneNews } = await supabase
        .from('news')
        .select('id, title, original_url')
        .eq('source', 'AA')
        .limit(1)
        .single();

    if (oneNews) {
        await supabase.from('news').delete().eq('id', oneNews.id);
        console.log(`   Deleted: ${oneNews.title}\n`);

        // 3. Run scraper
        console.log('3. Running AA scraper...');
        await scrapeAA();

        // 4. Check if it was re-added with category_id
        console.log('\n4. Checking if news was re-added with category_id...');
        const { data: reAdded } = await supabase
            .from('news')
            .select('id, title, category, category_id')
            .eq('original_url', oneNews.original_url)
            .single();

        if (reAdded) {
            console.log(`   ✅ Re-added: ${reAdded.title}`);
            console.log(`   Category: ${reAdded.category}`);
            console.log(`   Category ID: ${reAdded.category_id}`);
            console.log(`   ${reAdded.category_id === gundemId ? '✅ CORRECT!' : '❌ WRONG!'}`);
        } else {
            console.log('   ❌ News was not re-added');
        }
    }
}

testCategoryMapping().catch(console.error);
