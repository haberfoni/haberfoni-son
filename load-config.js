
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to public/config.js (assuming this script is in the root or scripts/ folder)
// If in root: ./public/config.js. If in scripts: ../public/config.js
// We'll try to find it relative to process.cwd() or __dirname
const configPath = path.resolve(process.cwd(), 'public', 'config.js');

let supabaseUrl = '';
let supabaseKey = '';

try {
    if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');

        // Simple regex parse to avoid eval
        // Looks for: API_URL: "..."
        const urlMatch = content.match(/API_URL:\s*["']([^"']+)["']/);
        const keyMatch = content.match(/API_KEY:\s*["']([^"']+)["']/);

        if (urlMatch && urlMatch[1]) supabaseUrl = urlMatch[1];
        if (keyMatch && keyMatch[1]) supabaseKey = keyMatch[1];
    } else {
        console.warn('Warning: public/config.js not found at', configPath);
    }
} catch (e) {
    console.error('Error reading public/config.js:', e);
}

// Fallback to env vars if file parsing failed or values missing
if (!supabaseUrl) supabaseUrl = process.env.VITE_SUPABASE_URL;
if (!supabaseKey) supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

export { supabaseUrl, supabaseKey };
