import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKokAd() {
    console.log('--- Inspecting Ad: kok ---');

    // Fetch by name 'kok' or placement 'home_list_top'
    const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .eq('placement_code', 'home_list_top');

    if (error) {
        console.error('Error fetching ads:', error);
    } else {
        console.log(`Found ${ads.length} ads for home_list_top.`);
        ads.forEach(ad => {
            console.log(`\nID: ${ad.id}, Name: ${ad.name}`);
            console.log(JSON.stringify(ad, null, 2));

            // Check for potential issues
            const now = new Date();
            if (ad.start_date && new Date(ad.start_date) > now) console.log('WARNING: Future start_date');
            if (ad.end_date && new Date(ad.end_date) < now) console.log('WARNING: Past end_date');
            if (!ad.is_active) console.log('WARNING: Ad is inactive');
        });
    }
}

checkKokAd();
