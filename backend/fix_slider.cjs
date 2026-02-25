const mysql = require('mysql2/promise');

async function run() {
    const c = await mysql.createConnection({ host: 'localhost', user: 'haberfoni_user', password: 'userpassword', database: 'haberfoni' });

    // Remove slider status from news without images
    const [updRes] = await c.execute("UPDATE news SET is_slider = 0 WHERE image_url IS NULL OR image_url = ''");
    console.log('Removed is_slider from imageless news:', updRes.affectedRows);

    await c.end();
}

run().catch(console.error);
