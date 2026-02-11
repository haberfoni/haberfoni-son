import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log('--- Checking RLS Policies ---');

    // Supabase JS client doesn't support raw SQL query directly on client easily without RPC
    // But we can check if we can fetch ads as 'anon'

    console.log('Attempting fetch as ANON user...');

    const { data, error } = await supabase
        .from('ads')
        .select('count')
        .limit(1);

    if (error) {
        console.error('Fetch Error:', error);
    } else {
        console.log(`Fetch Success. Count available? ${data ? 'Yes' : 'No'}`);
        console.log('Data:', data);
    }
}

checkRLS();
