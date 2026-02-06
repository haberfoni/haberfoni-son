import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkDraftLeaks() {
    console.log('=== Checking for Drafts Leaking into Slider/Surmanset ===\n');

    // 1. Check Manual Headlines
    const { data: manualHeadlines } = await supabase
        .from('headlines')
        .select('*, news:news_id (*)')
        .order('order_index', { ascending: true });

    console.log('1. Manual Headlines Analysis:');
    manualHeadlines?.forEach(h => {
        if (h.news) {
            const isPublished = !!h.news.published_at;
            if (!isPublished) {
                console.warn(`   ⚠️ LEAK DETECTED: Slot ${h.order_index} - "${h.news.title}" is DRAFT (published_at: null)`);
            } else {
                console.log(`   OK: Slot ${h.order_index} is Published`);
            }
        }
    });

    // 2. Check Surmanset
    const { data: surmanset } = await supabase
        .from('news')
        .select('id, title, published_at, is_surmanset')
        .eq('is_surmanset', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

    console.log('\n2. Surmanset Analysis:');
    surmanset?.forEach(n => {
        const isPublished = !!n.published_at;
        if (!isPublished) {
            console.warn(`   ⚠️ LEAK DETECTED: Surmanset - "${n.title}" is DRAFT (published_at: null)`);
        } else {
            console.log(`   OK: Surmanset "${n.title.substring(0, 30)}..." is Published`);
        }
    });

}

checkDraftLeaks().catch(console.error);
