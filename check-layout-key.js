import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLayoutByKey() {
    console.log('--- Checking site_settings for key="home_layout" ---');

    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('key', 'home_layout')
        .single();

    if (error) {
        console.error('Error:', error);
    } else if (data) {
        console.log('Found home_layout setting:');
        console.log(data.value); // This should be the JSON object

        const layout = data.value;
        const sections = layout.sections || [];
        const hasListTop = sections.find(s => s.id === 'home_list_top');

        if (hasListTop) {
            console.log('\nhome_list_top IS present in DB config.');
        } else {
            console.log('\nhome_list_top IS MISSING from DB config.');
        }

    } else {
        console.log('No "home_layout" key found.');
    }
}

checkLayoutByKey();
