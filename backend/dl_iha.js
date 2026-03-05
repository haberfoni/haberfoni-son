const axios = require('axios');
const fs = require('fs');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function downloadIHAHTML() {
    const url = 'https://www.iha.com.tr/video';
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000, httpsAgent });
    fs.writeFileSync('iha_video_landing.html', response.data);
    console.log("IHA Video HTML saved");
}
downloadIHAHTML();
