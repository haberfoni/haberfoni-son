import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, 'bot/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function backfillSummaries() {
    console.log('Backfilling IHA summaries...');

    // Fetch IHA news created today that don't have the suffix
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: newsItems, error } = await supabase
        .from('news')
        .select('id, summary, title')
        .eq('source', 'IHA')
        .gte('created_at', startOfDay.toISOString())
        .not('summary', 'ilike', '%İhlas Haber Ajansı');

    if (error) {
        console.error('Error fetching news:', error);
        return;
    }

    console.log(`Found ${newsItems.length} items to update.`);

    for (const item of newsItems) {
        if (!item.summary) continue;

        const newSummary = item.summary + ' - İhlas Haber Ajansı';

        const { error: updateError } = await supabase
            .from('news')
            .update({ summary: newSummary })
            .eq('id', item.id);

        if (!updateError) {
            console.log(`Updated: ${item.title.substring(0, 30)}...`);
        } else {
            console.error(`Failed to update ${item.id}:`, updateError.message);
        }
    }
    console.log('Backfill complete.');
}

backfillSummaries();
