import { createClient } from '@supabase/supabase-js';

// Runtime Config (config.js) öncelikli, yoksa Environment Variable (.env) kullanılır
const config = window.APP_CONFIG || {};
// "API_URL" ve "API_KEY" generic isimlendirmeleri de desteklenir (White-label için)
const supabaseUrl = config.API_URL || config.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = config.API_KEY || config.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL veya Key eksik! Lütfen public/config.js dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export { supabaseUrl, supabaseKey };
