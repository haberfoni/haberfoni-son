const mysql = require('mysql2/promise');

async function run() {
    const c = await mysql.createConnection({ host: 'localhost', user: 'haberfoni_user', password: 'userpassword', database: 'haberfoni' });

    const [res] = await c.execute("SELECT count(*) as cnt FROM news WHERE source = 'IHA' AND summary LIKE '%İhlas Haber Ajansı%'");
    console.log(`Found ${res[0].cnt} badly scraped IHA news.`);

    if (res[0].cnt > 0) {
        const [del] = await c.execute("DELETE FROM news WHERE source = 'IHA' AND summary LIKE '%İhlas Haber Ajansı%'");
        console.log('Deleted broken IHA news:', del.affectedRows);
    } else {
        console.log("No broken IHA news found to delete.");
    }

    await c.end();
}

run().catch(console.error);
