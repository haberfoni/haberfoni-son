/**
 * fix_iha_summaries_v2.cjs 
 * Fixes ALL IHA news summaries - re-fetches from og:description
 * and updates if the scraped version is longer than DB version.
 */
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: 'localhost', port: 3306,
    user: 'haberfoni_user', password: 'userpassword', database: 'haberfoni',
};

async function main() {
    const db = await mysql.createConnection(DB_CONFIG);

    // Get all recent IHA news with summaries (last 100)
    const [rows] = await db.execute(
        `SELECT id, CHAR_LENGTH(summary) as slen, original_url, LEFT(summary,60) as preview
         FROM news WHERE source='IHA' AND original_url IS NOT NULL
         ORDER BY created_at DESC LIMIT 100`
    );
    console.log(`Found ${rows.length} IHA rows to check.`);

    let updated = 0;
    for (const row of rows) {
        try {
            const r = await axios.get(row.original_url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 12000
            });
            const $ = cheerio.load(r.data);
            const fullSummary = (
                $('meta[name="description"]').attr('content') ||
                $('meta[property="og:description"]').attr('content') || ''
            ).replace(/\s+/g, ' ').trim();

            // Update if the fresh summary is longer than than the stored one
            if (fullSummary && fullSummary.length > (row.slen || 0)) {
                await db.execute("UPDATE news SET summary=? WHERE id=?", [fullSummary, row.id]);
                console.log(`Updated #${row.id}: DB=${row.slen} -> Fresh=${fullSummary.length} chars: ${fullSummary.substring(0, 50)}...`);
                updated++;
            }
        } catch (e) { /* skip failed URLs */ }
        await new Promise(r => setTimeout(r, 200));
    }
    console.log(`Done. Updated ${updated} records.`);
    await db.end();
}
main().catch(console.error);
