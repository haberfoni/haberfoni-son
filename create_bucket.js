
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elrxpnzihsjugndbgvrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
    console.log('Attempting to create "images" bucket...');

    // Check if it exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Error listing buckets:', listError);
    } else {
        const exists = buckets.find(b => b.name === 'images');
        if (exists) {
            console.log('"images" bucket already exists.');
            return;
        }
    }

    // Attempt creation
    const { data, error } = await supabase.storage.createBucket('images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
    });

    if (error) {
        console.error('Failed to create bucket:', error);
        console.log('\nNOTE: If this failed with a permission error (new row violates row-level security policy), you MUST create it manually in the Supabase Dashboard.');
    } else {
        console.log('Successfully created "images" bucket!', data);
    }
}

createBucket();
