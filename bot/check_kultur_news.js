import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkCategoryNews() {
    console.log('=== Checking News for Category: Kultur Sanat ===\n');

    // 1. Get Category ID
    const { data: category } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('slug', 'kultur-sanat') // Assuming slug is 'kultur-sanat'
        .single();

    if (!category) {
        console.error('Category "kultur-sanat" not found!');
        // Try to list all categories to see actual slug
        const { data: cats } = await supabase.from('categories').select('slug');
        console.log('Available Categogies:', cats?.map(c => c.slug).join(', '));
        return;
    }

    console.log(`Category ID: ${category.id}`);

    // 2. Fetch Latest News
    const { data: news } = await supabase
        .from('news')
        .select('id, title, published_at, created_at')
        .eq('category_id', category.id)
        .order('published_at', { ascending: false })
        .limit(5);

    console.log(`\nFound ${news?.length || 0} news items:`);
    news?.forEach(n => {
        console.log(`- ${n.title}`);
        console.log(`  Published: ${n.published_at}`);
        console.log(`  Created: ${n.created_at}`);
    });
}

checkCategoryNews().catch(console.error);
