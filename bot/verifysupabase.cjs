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
        const { error } = await supabase.from('news').select('id').limit(1);

        if (error) {
            console.error('Supabase Error:', error);
        } else {
            console.log('Connection Successful!');
        }

    } catch (e) {
        console.error('Exception:', e);
    }
}

test();
