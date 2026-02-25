/**
 * fix_iha_summaries_v3.cjs
 * For IHA news where meta description is truncated mid-sentence (no trailing dot),
 * re-fetches the first <p> from article body and uses that as summary.
 */
const axios = require('axios');
const cheerio = require('cheerio');
const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: 'localhost', port: 3306,
    user: 'haberfoni_user', password: 'userpassword', database: 'haberfoni',
};

async function getFirstParagraph(url) {
    try {
        const r = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 12000 });
        const $ = cheerio.load(r.data);
        const containers = ['.widget_General_News_Detail', '.news-detail__content', '.habericerik', 'article'];
        for (const sel of containers) {
            const firstP = $(sel).find('p').first().text().trim();
            if (firstP && firstP.length > 80) return firstP;
        }
    } catch (e) { }
    return null;
}

async function main() {
    const db = await mysql.createConnection(DB_CONFIG);

    // Get IHA news with summaries that don't end with a period (truncated mid-sentence)
    const [rows] = await db.execute(
        `SELECT id, summary, original_url FROM news 
         WHERE source='IHA' AND original_url IS NOT NULL
         AND (summary NOT LIKE '%.' OR CHAR_LENGTH(summary) < 120)
         ORDER BY created_at DESC LIMIT 100`
    );
    console.log(`Found ${rows.length} IHA rows with potentially truncated summaries.`);

    let updated = 0;
    for (const row of rows) {
        const newSummary = await getFirstParagraph(row.original_url);
        if (newSummary && newSummary.length > (row.summary?.length || 0)) {
            await db.execute("UPDATE news SET summary=? WHERE id=?", [newSummary, row.id]);
            console.log(`Updated #${row.id}: ${newSummary.substring(0, 60)}...`);
            updated++;
        }
        await new Promise(r => setTimeout(r, 200));
    }
    console.log(`Done. Updated ${updated} summaries.`);
    await db.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
