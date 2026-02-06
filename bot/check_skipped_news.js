import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkSkippedNews() {
    console.log('=== Checking Skipped News Status ===\n');

    // Title from the log
    const title = "İran Dışişleri Bakanı, diplomasiye iyi niyetle ancak haklarından taviz vermeden gireceklerini belirtti";

    const { data: news, error } = await supabase
        .from('news')
        .select('id, title, is_active, published_at, created_at, original_url')
        .ilike('title', `%${title.substring(0, 20)}%`) // Partial match to be safe
        .limit(5);

    if (error) {
        console.error('Error fetching news:', error);
        return;
    }

    console.log(`Found ${news?.length || 0} matches:`);
    news?.forEach(n => {
        console.log(`- ID: ${n.id}`);
        console.log(`  Title: ${n.title}`);
        console.log(`  Active: ${n.is_active}`);
        console.log(`  Published: ${n.published_at}`);
        console.log(`  Created: ${n.created_at}`);
        console.log(`  Original URL: ${n.original_url}`);
    });
}

checkSkippedNews().catch(console.error);
