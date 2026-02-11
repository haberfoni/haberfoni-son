import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { scrapeAA } from './src/scrapers/aa.js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debugAA() {
    console.log('=== Debug AA Scraper ===\n');

    // Delete one specific article to test
    console.log('1. Deleting test article...');
    await supabase
        .from('news')
        .delete()
        .eq('source', 'AA')
        .ilike('title', '%İran asıllı Prof%');

    console.log('   ✅ Deleted.\n');

    // Run Scraper (will show debug logs)
    console.log('2. Running AA Scraper (watch for [DEBUG] logs)...\n');
    await scrapeAA();
}

debugAA();
