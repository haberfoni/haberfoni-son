import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');

    try {
        // Test Categories
        const { data: categories, error: catError } = await supabase.from('categories').select('*');
        if (catError) console.error('Categories Error:', catError);
        else console.log('Categories:', categories);

        // Test News
        const { data: news, error: newsError } = await supabase.from('news').select('*').limit(5);
        if (newsError) console.error('News Error:', newsError);
        else console.log('News:', news);

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
