import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkHeadlinesTime() {
    console.log('=== Checking Headlines for Date Issues ===\n');

    // Replicate fetchHeadlines logic manually
    const { data: manualHeadlines } = await supabase
        .from('headlines')
        .select('*, news:news_id (*)')
        .not('news.published_at', 'is', null)
        .order('order_index', { ascending: true });

    console.log('1. Manual Headlines:');
    manualHeadlines?.forEach(h => {
        if (h.news) {
            console.log(`Slot ${h.order_index}: ${h.news.title}`);
            console.log(`   Published At: ${h.news.published_at} (${typeof h.news.published_at})`);
            console.log(`   Slug: ${h.news.slug}`);
            console.log(`   Link: /kategori/${h.news.category}/${h.news.slug || 'XXX'}`);
            if (!h.news.published_at) console.warn('   ⚠️ WARNING: Published at is missing/null!');
        }
    });

    // Check latest news (auto-fill candidates)
    const { data: latestNews } = await supabase
        .from('news')
        .select('id, title, published_at, slug, category')
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(15);

    console.log('\n2. Latest News (Auto-fill candidates):');
    latestNews?.forEach(n => {
        console.log(`- ${n.title}`);
        console.log(`   Published At: ${n.published_at}`);
        if (!n.published_at) console.warn('   ⚠️ WARNING: Published at is null!');
    });
}

checkHeadlinesTime().catch(console.error);
