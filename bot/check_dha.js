
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkDHA() {
    console.log('Checking DHA Mappings...');

    // Check All mappings first
    const { data: all, error: errAll } = await supabase
        .from('bot_category_mappings')
        .select('*');

    if (errAll) console.error("Error getting all:", errAll);
    else {
        console.log(`Total Mappings: ${all.length}`);
        const dha = all.filter(m => m.source_name === 'DHA');
        console.log(`DHA Mappings Found: ${dha.length}`);
        if (dha.length > 0) console.table(dha);
        else console.log("No DHA mappings found. This is why DHA is not running.");
    }
}

checkDHA();
