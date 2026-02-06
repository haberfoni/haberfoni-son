import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkDhaSuffix() {
    console.log('=== Checking DHA Summary Suffix ===\n');

    const { data: news, error } = await supabase
        .from('news')
        .select('title, summary')
        .eq('source', 'DHA')
        .order('created_at', { ascending: false })
        .limit(3);

    if (error) {
        console.error('Error fetching news:', error);
        return;
    }

    if (news && news.length > 0) {
        news.forEach((n, i) => {
            console.log(`\n[${i + 1}] Summary: ${n.summary.substring(n.summary.length - 30)}`);
            if (n.summary.endsWith(' - Demirören Haber Ajansı')) {
                console.log('    ✅ OK: Suffix found');
            } else {
                console.log('    ❌ ERROR: Suffix NOT found');
            }
        });
    } else {
        console.log('   ⚠️ No news found.');
    }
}

checkDhaSuffix().catch(console.error);
