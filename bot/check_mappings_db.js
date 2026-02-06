
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkMappings() {
    console.log('Checking Bot Category Mappings...');

    const { data, error } = await supabase
        .from('bot_category_mappings')
        .select('source_name, source_url, target_category_slug, last_scraped_at, last_status, last_item_count');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.table(data);
    }
}

checkMappings();
