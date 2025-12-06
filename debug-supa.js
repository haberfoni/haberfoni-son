import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elrxpnzihsjugndbgvrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('Debugging News Categories...');

    const { data: categories } = await supabase.from('categories').select('*');
    console.log('Categories found:', categories.length);

    for (const cat of categories) {
        if (['gundem', 'medya', 'politika'].includes(cat.slug)) {
            const { count, error } = await supabase
                .from('news')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', cat.id);

            console.log(`Category: ${cat.name} (${cat.slug}) - ID: ${cat.id} - News Count: ${count}`);
            if (error) console.error(error);
        }
    }
}

debug();
