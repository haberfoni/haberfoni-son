import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkCategoryIssue() {
    console.log('=== Checking Category Issue ===\n');

    // 1. Check categories table
    console.log('1. Available categories:');
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (catError) {
        console.error('Error fetching categories:', catError);
    } else {
        categories.forEach(cat => {
            console.log(`  - ID: ${cat.id}, Slug: ${cat.slug}, Name: ${cat.name}`);
        });
    }

    // 2. Check recent AA news
    console.log('\n2. Recent AA news:');
    const { data: news, error: newsError } = await supabase
        .from('news')
        .select('id, title, category, category_id, source')
        .eq('source', 'AA')
        .order('created_at', { ascending: false })
        .limit(3);

    if (newsError) {
        console.error('Error fetching news:', newsError);
    } else {
        news.forEach(n => {
            console.log(`  - Title: ${n.title.substring(0, 50)}...`);
            console.log(`    category: "${n.category}", category_id: ${n.category_id}`);
        });
    }

    // 3. Find gundem category ID
    const gundemCat = categories?.find(c => c.slug === 'gundem');
    if (gundemCat) {
        console.log(`\n3. Gündem category ID: ${gundemCat.id}`);
        console.log(`   ⚠️ AA news should have category_id = ${gundemCat.id}`);
    }
}

checkCategoryIssue().catch(console.error);
