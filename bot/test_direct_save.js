import { getCategoryIdBySlug, saveNews } from './src/db.js';

async function testDirectSave() {
    console.log('=== Testing Direct Save with Category ID ===\n');

    // 1. Test category lookup
    const gundemId = await getCategoryIdBySlug('gundem');
    console.log(`1. getCategoryIdBySlug('gundem'): ${gundemId}\n`);

    // 2. Create a test news item
    const testNews = {
        title: 'TEST HABER - Category ID Test ' + Date.now(),
        summary: 'Bu bir test haberidir',
        content: 'Test içerik',
        original_url: 'https://test.com/test-' + Date.now(),
        image_url: 'https://test.com/image.jpg',
        source: 'AA',
        category: 'gundem',
        keywords: 'test'
    };

    console.log('2. Saving test news...');
    const success = await saveNews(testNews);
    console.log(`   Result: ${success ? '✅ Saved' : '❌ Failed'}\n`);

    // 3. Check if it was saved with category_id
    if (success) {
        const { createClient } = await import('@supabase/supabase-js');
        const { default: dotenv } = await import('dotenv');
        dotenv.config();

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

        const { data } = await supabase
            .from('news')
            .select('id, title, category, category_id')
            .eq('original_url', testNews.original_url)
            .single();

        if (data) {
            console.log('3. Saved news details:');
            console.log(`   Title: ${data.title}`);
            console.log(`   Category: ${data.category}`);
            console.log(`   Category ID: ${data.category_id}`);
            console.log(`   ${data.category_id === gundemId ? '✅ CORRECT!' : '❌ WRONG!'}`);
        }
    }
}

testDirectSave().catch(console.error);
