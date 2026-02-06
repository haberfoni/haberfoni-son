import { createClient } from '@supabase/supabase-js';
import { scrapeAA } from './src/scrapers/aa.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testAAGundem() {
    console.log('=== Testing AA Gündem Scraper ===\n');

    // 1. Check bot_settings table
    console.log('1. Checking bot_settings for AA...');
    const { data: settings, error: settingsError } = await supabase
        .from('bot_settings')
        .select('*')
        .eq('source_name', 'AA')
        .single();

    if (settingsError) {
        console.error('Error fetching bot settings:', settingsError.message);
    } else {
        console.log('AA Settings:', JSON.stringify(settings, null, 2));
    }

    // 2. Check bot_category_mappings table
    console.log('\n2. Checking bot_category_mappings for AA...');
    const { data: mappings, error: mappingsError } = await supabase
        .from('bot_category_mappings')
        .select('*')
        .eq('source_name', 'AA');

    if (mappingsError) {
        console.error('Error fetching mappings:', mappingsError.message);
    } else {
        console.log('AA Mappings:', JSON.stringify(mappings, null, 2));
    }

    // 3. Test the scraper
    console.log('\n3. Running AA scraper...');
    await scrapeAA();

    // 4. Check recent news from AA
    console.log('\n4. Checking recently saved AA news...');
    const { data: recentNews, error: newsError } = await supabase
        .from('news')
        .select('id, title, category, source, published_at, created_at')
        .eq('source', 'AA')
        .order('created_at', { ascending: false })
        .limit(5);

    if (newsError) {
        console.error('Error fetching recent news:', newsError.message);
    } else {
        console.log('Recent AA News:');
        recentNews.forEach((news, idx) => {
            console.log(`  ${idx + 1}. ${news.title}`);
            console.log(`     Category: ${news.category}, Published: ${news.published_at ? 'Yes' : 'Draft'}`);
        });
    }

    console.log('\n=== Test Complete ===');
}

testAAGundem().catch(console.error);
