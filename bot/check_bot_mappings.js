import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkMappings() {
    console.log('=== Checking Bot Category Mappings ===\n');

    const { data: mappings, error } = await supabase
        .from('bot_category_mappings')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching mappings:', error);
        return;
    }

    console.log(`Found ${mappings?.length || 0} active mappings:`);
    mappings?.forEach(m => {
        console.log(`- [${m.source_name}] ${m.source_url} -> ${m.target_category_slug}`);
    });

    const kulturMapping = mappings?.find(m => m.target_category_slug.includes('kultur') || m.source_url.includes('kultur'));
    if (!kulturMapping) {
        console.warn('\n⚠️ WARNING: No active mapping found for Kultur/Sanat!');
    } else {
        console.log('\n✅ OK: Kultur/Sanat mapping exists.');
    }
}

checkMappings().catch(console.error);
