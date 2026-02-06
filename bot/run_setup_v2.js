
import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const { Pool } = pg;
const connectionString = "postgres://postgres.lvbyxrinwkzcjzvbozfu:Supabase2024!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({ connectionString });

async function runSetup() {
    console.log('Running Setup V2 (Bot Commands & Tracking)...');
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'setup_v2.sql'), 'utf8');
        await pool.query(sql);
        console.log('Setup V2 successful.');
    } catch (err) {
        console.error('Setup V2 failed:', err);
    } finally {
        await pool.end();
    }
}

runSetup();
