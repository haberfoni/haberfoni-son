
// Mock Browser Environment
global.window = {
    APP_CONFIG: {
        API_URL: 'https://default-url.supabase.co',
        API_KEY: 'default-key'
    }
};

global.localStorage = {
    store: {},
    getItem: function (key) { return this.store[key] || null; },
    setItem: function (key, value) { this.store[key] = value.toString(); },
    removeItem: function (key) { delete this.store[key]; },
    clear: function () { this.store = {}; }
};

// Mock Import Meta Env
// global.import = { meta: { env: { VITE_SUPABASE_URL: 'env-url', VITE_SUPABASE_ANON_KEY: 'env-key' } } };
// Note: import.meta is hard to mock in CommonJS/Node directly without modules, 
// so we will focus on the Logic which uses `import.meta.env` as fallback.
// In our logic: config.API_URL || import.meta.env....

// --- The Logic from src/services/supabase.js ---
function getSupabaseConfig() {
    let customConfig = {};
    try {
        const stored = localStorage.getItem('CUSTOM_APP_CONFIG');
        if (stored) customConfig = JSON.parse(stored);
    } catch (e) {
        console.error('Error parsing custom config', e);
    }

    // Priority: LocalStorage > Window Config (config.js) > Environment Variable (.env)
    const config = { ...(window.APP_CONFIG || {}), ...customConfig };

    const supabaseUrl = config.API_URL || config.VITE_SUPABASE_URL || 'env-fallback-url';
    const supabaseKey = config.API_KEY || config.VITE_SUPABASE_ANON_KEY || 'env-fallback-key';

    return { supabaseUrl, supabaseKey };
}

// --- Verification Tests ---

console.log('--- TEST 1: Default Config (window.APP_CONFIG) ---');
console.log('Expected: default-url / default-key');
let result = getSupabaseConfig();
console.log('Actual:  ', result.supabaseUrl, '/', result.supabaseKey);
if (result.supabaseUrl === 'https://default-url.supabase.co') console.log('PASS'); else console.log('FAIL');


console.log('\n--- TEST 2: LocalStorage Override ---');
console.log('Expected: custom-url / custom-key');
// Simulate Admin Panel Saving Config
const newConfig = {
    API_URL: 'https://custom-url.supabase.co',
    API_KEY: 'custom-key',
    VITE_SUPABASE_URL: 'https://custom-url.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'custom-key'
};
localStorage.setItem('CUSTOM_APP_CONFIG', JSON.stringify(newConfig));

result = getSupabaseConfig();
console.log('Actual:  ', result.supabaseUrl, '/', result.supabaseKey);
if (result.supabaseUrl === 'https://custom-url.supabase.co') console.log('PASS'); else console.log('FAIL');

console.log('\n--- TEST 3: Reset Config (Clear LocalStorage) ---');
console.log('Expected: default-url / default-key');
localStorage.removeItem('CUSTOM_APP_CONFIG');

result = getSupabaseConfig();
console.log('Actual:  ', result.supabaseUrl, '/', result.supabaseKey);
if (result.supabaseUrl === 'https://default-url.supabase.co') console.log('PASS'); else console.log('FAIL');
