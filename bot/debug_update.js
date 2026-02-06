
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debug() {
    console.log('--- Debugging Update ---');

    // 1. Fetch by slug
    const { data, error } = await supabase
        .from('bot_category_mappings')
        .select('*')
        .eq('target_category_slug', 'kultur-sanat') // IHA example
        .single();

    if (error) {
        console.error('Fetch error:', error);
        return;
    }

    if (!data) {
        console.error('No row found for slug: kultur-sanat');
        return;
    }

    console.log('Row found:', data);
    console.log('Source URL in DB:', JSON.stringify(data.source_url));

    // 2. Try Update by ID
    console.log('Attempting update by ID:', data.id);
    const { data: updateData, error: updateError } = await supabase
        .from('bot_category_mappings')
        .update({ last_status: 'DEBUG_TEST' })
        .eq('id', data.id)
        .select();

    if (updateError) {
        console.error('Update by ID FAILED:', updateError);
    } else {
        console.log('Update by ID SUCCESS:', updateData);
    }

    // 3. Try Update by URL (reproducing bot logic)
    console.log('Attempting update by URL:', data.source_url);
    const { data: urlData, error: urlError } = await supabase
        .from('bot_category_mappings')
        .update({ last_status: 'DEBUG_URL_TEST' })
        .eq('source_url', data.source_url)
        .select();

    if (urlError) {
        console.error('Update by URL FAILED:', urlError);
    } else if (!urlData || urlData.length === 0) {
        console.error('Update by URL returned 0 rows! (String mismatch suspected? Or RLS weirdness)');
    } else {
        console.log('Update by URL SUCCESS:', urlData);
    }
}

debug();
