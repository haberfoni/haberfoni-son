import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvbyxrinwkzcjzvbozfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Ynl4cmlud2t6Y2p6dmJvemZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTEwOTYsImV4cCI6MjA4NTY4NzA5Nn0.b2U6EfdTvZ62ZivP2YstCONCSgoqwlbBvB0nXEsra6s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setAdmin() {
    console.log('Logging in...');
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'ahmetcansertce@hotmail.com',
        password: '123456'
    });

    if (loginError) {
        console.error('Login Failed:', loginError.message);
        return;
    }

    console.log('Login successful. Inserting Admin Profile...');
    const { error: insertError } = await supabase
        .from('profiles')
        .insert({
            id: session.user.id,
            email: 'ahmetcansertce@hotmail.com',
            full_name: 'Ahmet Can Sertçe',
            role: 'admin' // Attempting to set admin role
        });

    if (insertError) {
        console.error('Profile Creation Failed:', insertError.message, insertError.details);
        // If profile already exists, try update (though usually users can't update their own role to admin if RLS is strict, but let's try)
        if (insertError.code === '23505') { // Unique violation
            console.log('Profile exists. Checking if update is needed...');
            // This part might fail if RLS prevents updating role, but worth a shot or manual SQL is needed.
        }
    } else {
        console.log('SUCCESS: Admin profile created!');
    }
}

setAdmin();
