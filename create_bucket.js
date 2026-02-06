
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from './load-config.js';

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
