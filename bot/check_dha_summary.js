import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkDhaSummaries() {
    console.log('=== Checking DHA News Summaries ===\n');

    const { data: news, error } = await supabase
        .from('news')
        .select('id, title, summary, source')
        .eq('source', 'DHA')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching news:', error);
        return;
    }

    if (!news || news.length === 0) {
        console.log('No DHA news found.');
        return;
    }

    news.forEach((n, i) => {
        console.log(`\n[${i + 1}] ID: ${n.id}`);
        console.log(`Title:   ${n.title}`);
        console.log(`Summary: ${n.summary}`);

        if (n.title === n.summary) {
            console.log('⚠️ IDENTICAL: Title and Summary are the same!');
        } else if (n.summary && n.summary.startsWith(n.title)) {
            console.log('⚠️ STARTS WITH: Summary starts with title!');
        } else {
            console.log('✅ OK: Different');
        }
    });
}

checkDhaSummaries().catch(console.error);
