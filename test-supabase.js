import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elrxpnzihsjugndbgvrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o';

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
