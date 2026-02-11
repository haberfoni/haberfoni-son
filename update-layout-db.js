import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateLayout() {
    console.log('--- Updating home_layout in DB ---');

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

    console.log('Current Sections:', layout.sections.map(s => s.id));

    // 2. Modify
    const newSection = {
        id: 'home_list_top',
        name: 'Ana Sayfa Liste Üstü',
        type: 'ad',
        enabled: true,
        removable: true
    };

    // Check if already exists just in case
    if (layout.sections.find(s => s.id === 'home_list_top')) {
        console.log('Already exists, skipping update.');
        return;
    }

    // Insert after surmanset or at index 3
    const index = layout.sections.findIndex(s => s.id === 'surmanset');
    if (index !== -1) {
        layout.sections.splice(index + 1, 0, newSection);
    } else {
        layout.sections.push(newSection);
    }

    console.log('New Sections:', layout.sections.map(s => s.id));

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

updateLayout();
