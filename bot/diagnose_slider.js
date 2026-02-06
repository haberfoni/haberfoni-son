import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { slugify } from './src/utils/slugify.js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
        console.log(`   Title: ${n.title}`);
        console.log(`   Slug (DB): ${n.slug}`);
        console.log(`   Slug (Generated from Title): ${slugify(n.title)}`);
        console.log(`   Category: ${n.category}`);
        console.log(`   Match? ${n.slug === slugify(n.title) ? 'YES' : 'NO (Suffix expected)'}\n`);
    });

    // 2. Simulate Headlines Fetch (Manual headlines)
    const { data: manualHeadlines } = await supabase
        .from('headlines')
        .select('*, news:news_id (id, title, slug, category)')
        .order('order_index', { ascending: true })
        .limit(5);

    console.log('2. Manual Headlines (Slider):');
    manualHeadlines?.forEach(h => {
        if (h.news) {
            console.log(`   Slot ${h.order_index}: ${h.news.title}`);
            console.log(`   News Slug: ${h.news.slug}`);
            console.log(`   News Category: ${h.news.category}`);
        } else {
            console.log(`   Slot ${h.order_index}: [No News Linked]`);
        }
    });

    // 3. Test explicit slug fetch query
    if (ihaNews && ihaNews.length > 0) {
        const testSlug = ihaNews[0].slug;
        const { data: bySlug } = await supabase
            .from('news')
            .select('id')
            .eq('slug', testSlug)
            .single();
        console.log(`\n3. Fetch by Slug '${testSlug}': ${bySlug ? 'FOUND' : 'NOT FOUND'}`);
    }
}

diagnoseSlider().catch(console.error);
