import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableSurmanset() {
    console.log('--- Disabling surmanset in home_layout ---');

    // 1. Fetch current
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'home_layout')
        .single();

    if (error || !data) {
        console.error('Error fetching:', error);
        return;
    }

    let layout = data.value;
    if (typeof layout === 'string') layout = JSON.parse(layout);

    // 2. Modify
    const surmanset = layout.sections.find(s => s.id === 'surmanset');
    if (surmanset) {
        surmanset.enabled = false;
        console.log('Disabled surmanset section.');
    } else {
        console.log('Surmanset section not found.');
    }

    // 3. Update
    const { error: updateError } = await supabase
        .from('site_settings')
        .update({ value: layout })
        .eq('key', 'home_layout');

    if (updateError) {
        console.error('Update Error:', updateError);
    } else {
        console.log('SUCCESS: Updated home_layout in DB.');
    }
}

disableSurmanset();
