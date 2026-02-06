import { createClient } from '@supabase/supabase-js';

// Custom Config from LocalStorage (Admin Panel Override)
let customConfig = {};
try {
    const stored = localStorage.getItem('CUSTOM_APP_CONFIG');
    if (stored) customConfig = JSON.parse(stored);
} catch (e) {
    console.error('Error parsing custom config', e);
}

// Priority: LocalStorage > Window Config (config.js) > Environment Variable (.env)
const config = { ...(window.APP_CONFIG || {}), ...customConfig };

// "API_URL" ve "API_KEY" generic isimlendirmeleri de desteklenir (White-label için)
const supabaseUrl = config.API_URL || config.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = config.API_KEY || config.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL veya Key eksik! Lütfen public/config.js dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export { supabaseUrl, supabaseKey };
