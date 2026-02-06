require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials!');
    process.exit(1);
}

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    try {
        // Try to fetch categories as a simple read test
        const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('Supabase Error:', error);
            // Check if it's a 404 or connection refused
        } else {
            console.log('Connection Successful!');
            console.log('Categories Count:', data); // data is null for head:true? count is in count
        }

        // Just select 1 news to be sure
        const { data: news, error: newsError } = await supabase.from('news').select('id').limit(1);
        if (newsError) {
             console.error('News Access Error:', newsError);
        } else {
             console.log('Read News Success. Count:', news.length);
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

test();
