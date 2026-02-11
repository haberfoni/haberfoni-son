import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkImages() {
    console.log('=== Checking Images in DB ===\n');

    const { data, error } = await supabase
        .from('news')
        .select('title, content, source')
        .eq('source', 'AA')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error(error);
        return;
    }

    data.forEach((n, i) => {
        const hasImg = n.content.includes('<img');
        const hasFigure = n.content.includes('<figure');

        console.log(`[${i + 1}] ${n.title.substring(0, 60)}`);
        console.log(`    Has <img>: ${hasImg}`);
        console.log(`    Has <figure>: ${hasFigure}`);

        if (hasImg) {
            const match = n.content.match(/<img[^>]+src="([^"]+)"/);
            if (match) {
                console.log(`    First img src: ${match[1].substring(0, 100)}`);
            }
        } else {
            console.log(`    ⚠️ NO IMAGES in content!`);
        }
        console.log('');
    });
}

checkImages();
