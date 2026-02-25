/**
 * fix_iha_images.cjs
 * For all IHA news records with null/empty image_url,
 * re-fetches the og:image from the original_url and updates the DB.
 */
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: 'localhost',
    port: 3306,
    user: 'haberfoni_user',
    password: 'userpassword',
    database: 'haberfoni',
};

const BLOCKED = ['bip.png', 'bip.jpg', 'next-header-aa', 'aa-logo', 'default.jpg', 'placeholder', 'logo.png', 'logo.jpg', 'logo.svg', 'noimage', 'no-image', 'no_image'];
function isBlocked(url) { if (!url) return true; const l = url.toLowerCase(); return BLOCKED.some(p => l.includes(p)); }

async function getImage(url) {
    try {
        const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 });
        const $ = cheerio.load(r.data);
        const og = $('meta[property="og:image"]').attr('content');
        if (og && !isBlocked(og)) return og.startsWith('http') ? og : 'https://www.iha.com.tr' + og;
    } catch (e) { /* skip */ }
    return null;
}

async function main() {
    const db = await mysql.createConnection(DB_CONFIG);
    const [rows] = await db.execute(
        "SELECT id, original_url FROM news WHERE source='IHA' AND (image_url IS NULL OR image_url='') AND original_url IS NOT NULL LIMIT 50"
    );
    console.log(`Found ${rows.length} IHA news without images.`);

    let updated = 0;
    for (const row of rows) {
        const img = await getImage(row.original_url);
        if (img) {
            await db.execute("UPDATE news SET image_url=? WHERE id=?", [img, row.id]);
            console.log(`Updated #${row.id} => ${img.substring(0, 60)}`);
            updated++;
        }
        await new Promise(r => setTimeout(r, 300));
    }
    console.log(`Done. Updated ${updated} records.`);
    await db.end();
}
main().catch(console.error);
