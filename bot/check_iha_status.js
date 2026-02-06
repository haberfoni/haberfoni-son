
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkIHAStatus() {
    console.log('--- checking IHA Mappings ---');
    const { data: mappings, error: mapError } = await supabase
        .from('bot_category_mappings')
        .select('*')
        .eq('source_name', 'IHA');

    if (mapError) console.error(mapError);
    else {
        console.table(mappings.map(m => ({
            slug: m.target_category_slug,
            url: m.source_url,
            active: m.is_active
        })));
    }

    console.log('\n--- Checking IHA News Distribution ---');
    const { data: news, error: newsError } = await supabase
        .from('news')
        .select('category')
        .eq('source', 'IHA');

    if (newsError) console.error(newsError);
    else {
        const distribution = {};
        news.forEach(n => {
            distribution[n.category] = (distribution[n.category] || 0) + 1;
        });
        console.table(distribution);
    }
}

checkIHAStatus();
