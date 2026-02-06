import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkColumns() {
    console.log("Checking database connection to:", process.env.SUPABASE_URL);

    // Check Headlines 'type'
    const { data: headlines, error: headlinesError } = await supabase
        .from('headlines')
        .select('type')
        .limit(1);

    if (headlinesError) {
        console.error("❌ Headlines 'type' column check FAILED:", headlinesError.message);
    } else {
        console.log("✅ Headlines 'type' column EXISTS.");
    }

    // Check Ads 'is_manset_2'
    const { data: ads, error: adsError } = await supabase
        .from('ads')
        .select('is_manset_2')
        .limit(1);

    if (adsError) {
        console.error("❌ Ads 'is_manset_2' column check FAILED:", adsError.message);
    } else {
        console.log("✅ Ads 'is_manset_2' column EXISTS.");
    }

    // Check News 'is_slider'
    const { data: news, error: newsError } = await supabase
        .from('news')
        .select('is_slider')
        .limit(1);

    if (newsError) {
        console.error("❌ News 'is_slider' column check FAILED:", newsError.message);
    } else {
        console.log("✅ News 'is_slider' column EXISTS.");
    }

    // Check Bot Settings
    const { data: bot, error: botError } = await supabase
        .from('bot_settings')
        .select('*')
        .limit(1);

    if (botError) {
        console.error("❌ Bot Settings table check FAILED:", botError.message);
    } else {
        console.log("✅ Bot Settings table EXISTS.");
    }
}

checkColumns();
