
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elrxpnzihsjugndbgvrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("Checking 'news' table...");
    const { data: news, error: newsError } = await supabase.from('news').select('*').limit(1);
    if (news && news.length > 0) {
        console.log("News keys:", Object.keys(news[0]));
    } else {
        console.log("News table empty or error:", newsError);
    }

    console.log("Checking 'photo_galleries' table...");
    const { data: photos, error: photosError } = await supabase.from('photo_galleries').select('*').limit(1);
    if (photos && photos.length > 0) {
        console.log("Photo keys:", Object.keys(photos[0]));
    }

    console.log("Checking 'videos' table...");
    const { data: videos, error: videosError } = await supabase.from('videos').select('*').limit(1);
    if (videos && videos.length > 0) {
        console.log("Video keys:", Object.keys(videos[0]));
    }
}

checkSchema();
