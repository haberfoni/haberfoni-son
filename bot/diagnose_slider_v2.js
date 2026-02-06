import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
    // Note: DB adds random suffix, this simple version does not
}

async function diagnoseSlider() {
    console.log('=== Diagnosing Slider & IHA Issues ===\n');

    // 1. Check recent IHA News
    const { data: ihaNews } = await supabase
        .from('news')
        .select('id, title, slug, category, created_at')
        .eq('source', 'IHA')
        .order('created_at', { ascending: false })
        .limit(3);

    console.log('1. Recent IHA News:');
    ihaNews?.forEach(n => {
        const simpleSlug = slugify(n.title);
        console.log(`   Title: ${n.title}`);
        console.log(`   Slug (DB): ${n.slug}`);
        console.log(`   Slug (Simple): ${simpleSlug}`);
        console.log(`   Match? ${n.slug === simpleSlug ? 'YES' : 'NO (Has suffix)'}\n`);
    });

    // 2. Simulate Headlines Fetch
    console.log('2. Headlines from DB (used in Slider):');
    const { data: manualHeadlines } = await supabase
        .from('headlines')
        .select('*, news:news_id (id, title, slug, category)')
        .order('order_index', { ascending: true })
        .limit(5);

    manualHeadlines?.forEach(h => {
        if (h.news) {
            console.log(`   Slot ${h.order_index}: ${h.news.title}`);
            console.log(`   News Slug: ${h.news.slug}`);
            console.log(`   News Category: ${h.news.category}`);
        } else {
            console.log(`   Slot ${h.order_index}: [No News Linked]`);
        }
    });
}

diagnoseSlider().catch(console.error);
