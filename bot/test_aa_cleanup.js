
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeAA } from './src/scrapers/aa.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testAACleanup() {
    console.log('=== Testing AA Cleanup ===\n');

    // 1. Delete recent AA news
    console.log('1. Deleting recent AA news...');
    const { error: delError } = await supabase
        .from('news')
        .delete()
        .eq('source', 'AA')
        .gte('created_at', new Date().toISOString().split('T')[0]);

    if (delError) console.error(delError);
    else console.log('   ✅ Deleted.');

    // 2. Run Scraper
    console.log('\n2. Running AA Scraper...');
    await scrapeAA();

    // 3. Verify
    console.log('\n3. Verifying...');
    const { data: news, error } = await supabase
        .from('news')
        .select('title, summary, content, author')
        .eq('source', 'AA')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    const forbiddenRegex = /[A-Za-zÇĞİÖŞÜçğıöşü\s]{2,50}\s?\|\s?\d{2}\.\d{2}\.\d{4}/;

    news.forEach((n, i) => {
        console.log(`\n[${i + 1}] Title: ${n.title}`);
        console.log(`    Author: ${n.author}`);
        console.log(`    Summary Length: ${n.summary ? n.summary.length : 0}`);

        if (n.summary && n.summary.length > 200) {
            console.log('    ✅ Summary > 200 chars (Fixed)');
        } else {
            console.log(`    ℹ️ Summary length: ${n.summary ? n.summary.length : 0}`);
        }

        const hasForbidden = forbiddenRegex.test(n.content);
        if (hasForbidden) {
            console.log('    ❌ ERROR: Content matches Author|Date pattern!');
            const match = n.content.match(forbiddenRegex);
            console.log('       Match:', match ? match[0] : 'N/A');
        } else {
            console.log('    ✅ Content clean (No Author|Date pattern)');
        }

        if (n.content && n.content.includes('<p>')) {
            console.log('    ✅ Content has HTML <p> tags');
        } else {
            console.log('    ⚠️ Content missing <p> tags?');
        }
    });
}

testAACleanup().catch(console.error);
