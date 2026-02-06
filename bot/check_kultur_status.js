import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkKulturStatus() {
    console.log('=== Checking IHA/DHA Kultur Sanat Status ===\n');

    const { data: mappings, error } = await supabase
        .from('bot_category_mappings')
        .select('*')
        .eq('target_category_slug', 'kultur-sanat')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching mappings:', error);
        return;
    }

    if (!mappings || mappings.length === 0) {
        console.log('No active mappings found for kultur-sanat.');
        return;
    }

    console.log(`Found ${mappings.length} active mappings:`);
    mappings.forEach(m => {
        console.log(`\nSource: ${m.source_name}`);
        console.log(`URL: ${m.source_url}`);
        console.log(`Last Scraped: ${m.last_scraped_at}`);
        console.log(`Last Status: ${m.last_status}`);
        console.log(`Last Item Count: ${m.last_item_count}`);
    });
}

checkKulturStatus().catch(console.error);
