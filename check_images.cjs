const mysql2 = require('./bot/node_modules/mysql2/promise');

async function check() {
    const conn = await mysql2.createConnection({
        host: 'localhost',
        user: 'haberfoni_user',
        password: 'userpassword',
        database: 'haberfoni'
    });
    const [rows] = await conn.execute(
        'SELECT id, title, image_url, source FROM news ORDER BY created_at DESC LIMIT 10'
    );
    console.table(rows.map(r => ({ id: r.id, source: r.source, has_image: !!r.image_url, image: (r.image_url || '').substring(0, 80), title: (r.title || '').substring(0, 40) })));
    await conn.end();
}

check().catch(console.error);
