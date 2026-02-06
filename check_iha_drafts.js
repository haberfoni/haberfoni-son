import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'bot/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkDrafts() {
    console.log('Checking IHA Drafts...');

    // Check total IHA news
    const { count: total, error: err1 } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'IHA');

    // Check published IHA news
    const { count: published, error: err2 } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('source', 'IHA')
        .not('published_at', 'is', null);

    // Check drafts
    const { data: drafts, error: err3 } = await supabase
        .from('news')
        .select('title, created_at')
        .eq('source', 'IHA')
        .is('published_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

    console.log(`\nResults for IHA:`);
    console.log(`Total News: ${total}`);
    console.log(`Published: ${published}`);
    console.log(`Drafts (Waiting): ${total - published}`);

    if (drafts && drafts.length > 0) {
        console.log('\nLatest Drafts:');
        drafts.forEach(d => console.log(`- ${d.title}`));
    }
}

checkDrafts();
