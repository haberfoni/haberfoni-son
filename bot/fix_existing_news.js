import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function fixExistingAANews() {
    console.log('=== Fixing Existing AA News ===\n');

    // Get gundem category ID
    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'gundem')
        .single();

    const gundemId = category.id;
    console.log(`Gündem category ID: ${gundemId}\n`);

    // Update all AA news with null category_id
    const { data: updated, error } = await supabase
        .from('news')
        .update({ category_id: gundemId })
        .eq('source', 'AA')
        .is('category_id', null)
        .select('id, title');

    if (error) {
        console.error('Error updating news:', error);
        return;
    }

    console.log(`✅ Updated ${updated.length} AA news items with category_id`);
    updated.forEach((news, idx) => {
        console.log(`  ${idx + 1}. ${news.title.substring(0, 60)}...`);
    });
}

fixExistingAANews().catch(console.error);
