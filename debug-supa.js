import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './load-config.js';

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
