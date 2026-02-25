const mysql2 = require('./bot/node_modules/mysql2/promise');

async function check() {
    const conn = await mysql2.createConnection({
        host: 'localhost',
        user: 'haberfoni_user',
        password: 'userpassword',
        database: 'haberfoni'
    });
    const [rows] = await conn.execute(
        'SELECT id, command, status, created_at FROM bot_commands ORDER BY created_at DESC LIMIT 5'
    );
    console.table(rows);
    await conn.end();
}

check().catch(console.error);
