import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'bot/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkKultur() {
    console.log('Checking "kultur-sanat" Category...');

    // 1. Check if category exists
    const { data: cat, error: catErr } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', 'kultur-sanat')
        .single();

    if (catErr) {
        console.error('Category Error:', catErr.message);
        if (catErr.code === 'PGRST116') console.log('Category "kultur-sanat" NOT FOUND in database!');
    } else {
        console.log(`Category Found: ID=${cat.id}, Name=${cat.name}`);

        // 2. Check news in this category
        const { count: total, error: err1 } = await supabase
            .from('news')
            .select('*', { count: 'exact', head: true })
            .eq('category', 'kultur-sanat'); // Check by slug stored in news

        const { count: byId, error: err2 } = await supabase
            .from('news')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', cat.id); // Check by ID

        console.log(`News with category='kultur-sanat' (slug string): ${total}`);
        console.log(`News with category_id='${cat.id}': ${byId}`);

        // 3. Check drafts vs published
        const { data: newsItems } = await supabase
            .from('news')
            .select('title, published_at, is_active, source')
            .or(`category.eq.kultur-sanat,category_id.eq.${cat.id}`)
            .order('created_at', { ascending: false })
            .limit(5);

        if (newsItems && newsItems.length > 0) {
            console.log('\nLatest "kultur-sanat" News:');
            newsItems.forEach(n => {
                const status = (n.published_at && n.is_active) ? '[PUBLISHED]' : '[DRAFT/HIDDEN]';
                console.log(`${status} ${n.title} (Source: ${n.source})`);
            });
        } else {
            console.log('No news found for this category.');
        }
    }
}

checkKultur();
