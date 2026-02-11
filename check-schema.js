import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('--- Checking site_settings schema ---');
    // Using a trick: fetch one row and list keys because we can't easily query information_schema via JS client
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        console.log('No data found, cannot infer columns.');
    }
}

checkSchema();
