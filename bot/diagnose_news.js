import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function diagnoseNewsIssue() {
    console.log('=== Diagnosing News Display Issue ===\n');

    // 1. Check gündem category
    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', 'gundem')
        .single();

    console.log('1. Gündem Category:');
    console.log(`   ID: ${category.id}`);
    console.log(`   Name: ${category.name}\n`);

    // 2. Check AA news with category_id
    const { data: withCategoryId } = await supabase
        .from('news')
        .select('id, title, category, category_id, published_at, is_active')
        .eq('source', 'AA')
        .eq('category_id', category.id);

    console.log(`2. AA News WITH category_id (${category.id}):`);
    console.log(`   Count: ${withCategoryId?.length || 0}`);
    withCategoryId?.slice(0, 3).forEach((n, i) => {
        console.log(`   ${i + 1}. ${n.title.substring(0, 50)}...`);
        console.log(`      Published: ${n.published_at ? 'Yes' : 'No'}, Active: ${n.is_active}`);
    });

    // 3. Check AA news WITHOUT category_id
    const { data: withoutCategoryId } = await supabase
        .from('news')
        .select('id, title, category, category_id, published_at, is_active')
        .eq('source', 'AA')
        .is('category_id', null);

    console.log(`\n3. AA News WITHOUT category_id (null):`);
    console.log(`   Count: ${withoutCategoryId?.length || 0}`);
    withoutCategoryId?.slice(0, 3).forEach((n, i) => {
        console.log(`   ${i + 1}. ${n.title.substring(0, 50)}...`);
        console.log(`      Category: ${n.category}, Published: ${n.published_at ? 'Yes' : 'No'}`);
    });

    // 4. Check what frontend query would return
    const { data: frontendQuery } = await supabase
        .from('news')
        .select('id, title, category_id, published_at, is_active')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(10);

    console.log(`\n4. Frontend Query Result (category_id=${category.id}, is_active=true, published):`);
    console.log(`   Count: ${frontendQuery?.length || 0}`);
    if (frontendQuery?.length === 0) {
        console.log('   ⚠️ NO NEWS FOUND - This is why the page is empty!');
    } else {
        frontendQuery?.forEach((n, i) => {
            console.log(`   ${i + 1}. ${n.title.substring(0, 50)}...`);
        });
    }
}

diagnoseNewsIssue().catch(console.error);
