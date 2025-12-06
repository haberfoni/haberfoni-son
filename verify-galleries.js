import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elrxpnzihsjugndbgvrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyGalleries() {
    console.log('Verifying Gallery Data...');

    // Check Videos
    const { data: videos, error: vidError } = await supabase.from('videos').select('*');
    if (vidError) console.error('Videos Error:', vidError);
    else console.log(`Videos found: ${videos.length}`);

    // Check Photo Galleries
    const { data: galleries, error: galError } = await supabase.from('photo_galleries').select('*');
    if (galError) console.error('Photo Galleries Error:', galError);
    else {
        console.log(`Photo Galleries found: ${galleries.length}`);

        if (galleries.length > 0) {
            const { count, error: imgError } = await supabase
                .from('gallery_images')
                .select('*', { count: 'exact', head: true })
                .eq('gallery_id', galleries[0].id);

            if (imgError) console.error('Gallery Images Error:', imgError);
            else console.log(`Images in first gallery: ${count}`);
        }
    }
}

verifyGalleries();
