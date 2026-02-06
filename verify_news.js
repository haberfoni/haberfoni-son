import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './load-config.js';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyNews() {
    console.log('--- Checking News Table ---');

    // 1. Check if we can select
    const { data: news, error: selectError } = await supabase.from('news').select('*').limit(5);
    if (selectError) {
        console.error('SELECT Error:', selectError.message);
    } else {
        console.log(`SELECT Success: Found ${news.length} news items.`);
    }

    // 2. Try to login (needed for insert usually due to RLS)
    console.log('\n--- Attempting Login ---');
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'ahmetcansertce@hotmail.com',
        password: '123456'
    });

    if (loginError) {
        console.error('Login Failed:', loginError.message);
        return;
    }
    console.log('Login Successful.');

    // 3. Try Insert with updater_id to check column existence
    console.log('\n--- Attempting Insert ---');
    const testNews = {
        title: 'Test News ' + Date.now(),
        slug: 'test-news-' + Date.now(),
        content: 'Test Content',
        category: 'gundem',
        author_id: session.user.id,
        updater_id: session.user.id, // This is the column we suspect causes issues
        published_at: new Date().toISOString()
    };

    const { data: inserted, error: insertError } = await supabase.from('news').insert(testNews).select();

    if (insertError) {
        console.error('INSERT Error:', insertError.message);
        console.error('Hint:', insertError.hint);
        console.error('Details:', insertError.details);
    } else {
        console.log('INSERT Success:', inserted);
    }
}

verifyNews();
