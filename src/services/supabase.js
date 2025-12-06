import { createClient } from '@supabase/supabase-js';

// TODO: Move these to .env file for better practice
// VITE_SUPABASE_URL=https://elrxpnzihsjugndbgvrv.supabase.co
// VITE_SUPABASE_ANON_KEY=...
const supabaseUrl = 'https://elrxpnzihsjugndbgvrv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o';

export const supabase = createClient(supabaseUrl, supabaseKey);
