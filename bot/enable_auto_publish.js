import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function enableAutoPublish() {
    console.log('=== Enabling Auto-Publish for AA ===\n');

    // Update AA bot settings to enable auto_publish
    const { data, error } = await supabase
        .from('bot_settings')
        .update({ auto_publish: true })
        .eq('source_name', 'AA')
        .select();

    if (error) {
        console.error('Error updating settings:', error);
        return;
    }

    console.log('✅ AA auto_publish enabled!');
    console.log('Settings:', JSON.stringify(data, null, 2));
    console.log('\nYeni AA haberleri artık otomatik olarak yayına girecek.');
}

enableAutoPublish().catch(console.error);
