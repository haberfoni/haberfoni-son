const mysql = require('./backend/node_modules/@prisma/client/../../../node_modules/.prisma/client');

// Try using mysql2 directly from bot
const mysql2 = require('./bot/node_modules/mysql2/promise');

async function fix() {
    const conn = await mysql2.createConnection({
        host: 'localhost',
        user: 'haberfoni_user',
        password: 'userpassword',
        database: 'haberfoni'
    });
    const [result] = await conn.execute(
        "UPDATE bot_commands SET status = 'COMPLETED' WHERE status IN ('PENDING', 'PROCESSING')"
    );
    console.log('Fixed rows:', result.affectedRows);
    await conn.end();
}

fix().catch(console.error);
