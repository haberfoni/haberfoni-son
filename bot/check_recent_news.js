
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkRecent() {
    console.log('--- Latest 5 DHA News ---');
    const { data: dha } = await supabase
        .from('news')
        .select('title, created_at, original_url')
        .eq('source', 'DHA')
        .order('created_at', { ascending: false })
        .limit(5);
    console.table(dha);

    console.log('\n--- Latest 5 IHA News ---');
    const { data: iha } = await supabase
        .from('news')
        .select('title, created_at, original_url')
        .eq('source', 'IHA')
        .order('created_at', { ascending: false })
        .limit(5);
    console.table(iha);
}

checkRecent();
