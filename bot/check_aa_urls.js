import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkAAUrls() {
    console.log('=== Checking AA URLs in Database ===\n');

    const { data, error } = await supabase
        .from('news')
        .select('id, title, original_url, image_url')
        .eq('source', 'AA')
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} AA news items:\n`);

    const mediaItems = [];
    const regularItems = [];

    data.forEach((item, i) => {
        const url = item.original_url || '';

        // Check for media content patterns
        const isPhoto = url.includes('/pgc/') || url.includes('foto-galeri') || url.includes('fotoraf');
        const isVideo = url.includes('/vgc/') || url.includes('video-galeri') || url.includes('video');
        const isInfographic = url.includes('/info/') || url.includes('infographic') || url.includes('infografik');

        if (isPhoto || isVideo || isInfographic) {
            const type = isPhoto ? 'PHOTO' : isVideo ? 'VIDEO' : 'INFOGRAPHIC';
            mediaItems.push({ type, item });
        } else {
            regularItems.push(item);
        }
    });

    if (mediaItems.length > 0) {
        console.log(`⚠️  Found ${mediaItems.length} MEDIA ITEMS (should be filtered):\n`);
        mediaItems.forEach(({ type, item }) => {
            console.log(`[${type}] ${item.title.substring(0, 60)}`);
            console.log(`   URL: ${item.original_url}`);
            console.log(`   Image: ${item.image_url ? 'Yes' : 'NO IMAGE'}\n`);
        });
    }

    console.log(`✅ Found ${regularItems.length} REGULAR NEWS ITEMS:\n`);
    regularItems.slice(0, 5).forEach(item => {
        console.log(`${item.title.substring(0, 60)}`);
        console.log(`   URL: ${item.original_url}\n`);
    });
}

checkAAUrls();
