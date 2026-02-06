
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function cleanGundem() {
    console.log('--- Removing IHA News from Gundem ---');

    // First, count how many we'll delete
    const { count } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'gundem')
        .eq('source', 'IHA');

    console.log(`Found ${count} IHA items in gundem category.`);

    if (count === 0) {
        console.log('Nothing to delete.');
        return;
    }

    // Delete them
    const { error } = await supabase
        .from('news')
        .delete()
        .eq('category', 'gundem')
        .eq('source', 'IHA');

    if (error) {
        console.error('Error deleting:', error);
    } else {
        console.log(`Successfully deleted ${count} IHA items from gundem.`);
    }

    // Verify
    const { count: remaining } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'gundem')
        .eq('source', 'IHA');

    console.log(`Remaining IHA items in gundem: ${remaining}`);
}

cleanGundem();
