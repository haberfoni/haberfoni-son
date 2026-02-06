
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function testUpdate() {
    console.log('--- Testing Update on bot_settings ---');

    // Get first ID
    const { data: list } = await supabase.from('bot_settings').select('id, auto_publish').limit(1);
    if (!list || list.length === 0) {
        console.log('No settings found');
        return;
    }
    const item = list[0];
    console.log('Current state:', item);

    // Try toggle
    const newVal = !item.auto_publish;
    console.log(`Attempting to set auto_publish to ${newVal}...`);

    const { data, error } = await supabase
        .from('bot_settings')
        .update({ auto_publish: newVal })
        .eq('id', item.id)
        .select();

    if (error) {
        console.error('UPDATE FAILED:', error.message);
    } else {
        console.log('UPDATE SUCCESS:', data);
    }
}

testUpdate();
