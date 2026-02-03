import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
    console.log('Testing login for ahmetcansertce@hotmail.com...');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ahmetcansertce@hotmail.com',
        password: '123456' // Assuming user set this simple password as implied
    });

    if (error) {
        console.error('Login Failed:', error.message);
    } else {
        console.log('Login Successful!');
        console.log('User ID:', data.user.id);

        // Check profile role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        console.log('User Role:', profile ? profile.role : 'No profile found');
    }
}

testLogin();
