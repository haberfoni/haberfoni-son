import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLayoutDB() {
    console.log('--- Checking site_settings home_layout ---');

    const { data, error } = await supabase
        .from('site_settings')
        .select('home_layout')
        .single();

    if (error) {
        console.error('Error fetching settings:', error);
        return;
    }

    if (!data || !data.home_layout) {
        console.log('No home_layout found in DB (Using defaults?)');
        return;
    }

    const layout = data.home_layout;
    console.log('Current DB Layout Sections:');
    const sections = layout.sections || [];
    sections.forEach(s => console.log(`- ${s.id} (${s.enabled ? 'Enabled' : 'Disabled'})`));

    const found = sections.find(s => s.id === 'home_list_top');
    if (found) {
        console.log(`\nhome_list_top IS present in DB config.`);
    } else {
        console.log(`\nhome_list_top IS MISSING from DB config.`);
    }
}

checkLayoutDB();
