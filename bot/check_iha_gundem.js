
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkIHAGundem() {
    console.log('--- Checking IHA Gundem News ---');

    const { data, error } = await supabase
        .from('news')
        .select('id, title, original_url, created_at')
        .eq('category', 'gundem')
        .eq('source', 'IHA')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Sample of ${data.length} IHA items in gundem:`);
    data.forEach(item => {
        console.log(`\n  Title: ${item.title}`);
        console.log(`  URL: ${item.original_url}`);
        console.log(`  Created: ${item.created_at}`);
    });

    // Check if there's an inactive mapping
    const { data: allMappings } = await supabase
        .from('bot_category_mappings')
        .select('*')
        .eq('source_name', 'IHA')
        .eq('target_category_slug', 'gundem');

    console.log(`\nIHA gundem mappings (including inactive): ${allMappings ? allMappings.length : 0}`);
    if (allMappings && allMappings.length > 0) {
        allMappings.forEach(m => {
            console.log(`  - URL: ${m.source_url} | Active: ${m.is_active} | ID: ${m.id}`);
        });
    }
}

checkIHAGundem();
