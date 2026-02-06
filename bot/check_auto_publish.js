import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkAutoPublish() {
    console.log('=== Checking Auto-Publish Status ===\n');

    // 1. Check bot settings
    const { data: settings } = await supabase
        .from('bot_settings')
        .select('*')
        .eq('source_name', 'AA')
        .single();

    console.log('1. AA Bot Settings:');
    console.log(`   Auto-Publish: ${settings?.auto_publish ? '✅ AÇIK' : '❌ KAPALI'}`);
    console.log(`   Active: ${settings?.is_active ? '✅ Aktif' : '❌ Pasif'}\n`);

    // 2. Check recent AA news
    const { data: recentNews } = await supabase
        .from('news')
        .select('id, title, published_at, category_id, created_at')
        .eq('source', 'AA')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log('2. Son AA Haberleri:');
    recentNews?.forEach((news, idx) => {
        const isPublished = news.published_at !== null;
        const hasCategory = news.category_id !== null;
        console.log(`   ${idx + 1}. ${news.title.substring(0, 50)}...`);
        console.log(`      Yayında: ${isPublished ? '✅ Evet' : '❌ Hayır (Taslak)'}`);
        console.log(`      Kategori ID: ${hasCategory ? '✅ Var' : '❌ Yok'}`);
    });
}

checkAutoPublish().catch(console.error);
