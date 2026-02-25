const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: 'localhost', port: 3306,
    user: 'haberfoni_user', password: 'userpassword', database: 'haberfoni',
};

async function main() {
    const db = await mysql.createConnection(DB_CONFIG);

    // Get IHA news with short summaries (likely truncated at 200 chars)
    const [rows] = await db.execute(
        `SELECT id, CHAR_LENGTH(summary) as slen, original_url, LEFT(summary, 80) as preview 
         FROM news WHERE source='IHA' AND summary IS NOT NULL 
         AND CHAR_LENGTH(summary) BETWEEN 195 AND 205
         ORDER BY created_at DESC LIMIT 20`
    );
    console.log(`Found ${rows.length} IHA rows with ~200 char summaries (likely truncated):`);
    for (const r of rows) {
        console.log(`  #${r.id} len=${r.slen}: ${r.preview}...`);
    }

    if (rows.length === 0) {
        console.log('No truncated summaries found.');
        await db.end();
        return;
    }

    // Now re-fetch og:description for each and update
    let updated = 0;
    for (const row of rows) {
        if (!row.original_url) continue;
        try {
            const r = await axios.get(row.original_url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 12000
            });
            const $ = cheerio.load(r.data);
            const fullSummary = ($('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '').replace(/\s+/g, ' ').trim();
            if (fullSummary && fullSummary.length > 200) {
                await db.execute("UPDATE news SET summary=? WHERE id=?", [fullSummary, row.id]);
                console.log(`Updated #${row.id}: ${fullSummary.length} chars`);
                updated++;
            }
        } catch (e) { console.log(`Skip #${row.id}: ${e.message.substring(0, 50)}`); }
        await new Promise(r => setTimeout(r, 300));
    }
    console.log(`Done. Updated ${updated} summaries.`);
    await db.end();
}
main().catch(console.error);
