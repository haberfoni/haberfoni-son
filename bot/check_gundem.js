
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkGundem() {
    console.log('--- Checking Gundem Mappings ---');

    // Check all mappings for gundem
    const { data: mappings, error } = await supabase
        .from('bot_category_mappings')
        .select('*')
        .eq('target_category_slug', 'gundem');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${mappings.length} mappings for 'gundem':`);
    mappings.forEach(m => {
        console.log(`\n  Source: ${m.source_name}`);
        console.log(`  URL: ${m.source_url}`);
        console.log(`  Active: ${m.is_active}`);
        console.log(`  ID: ${m.id}`);
    });

    // Check news counts
    console.log('\n--- News Counts in Gundem ---');
    const sources = ['AA', 'IHA', 'DHA'];
    for (const source of sources) {
        const { count } = await supabase
            .from('news')
            .select('*', { count: 'exact', head: true })
            .eq('category', 'gundem')
            .eq('source', source);

        console.log(`${source}: ${count} items`);
    }
}

checkGundem();
