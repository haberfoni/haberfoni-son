const axios = require('axios');
const fs = require('fs');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function downloadIHAHTML() {
    const url = 'https://www.iha.com.tr/video-umraniyede-akran-zorbaligi-iddiasi-celme-takilan-ogrencinin-kolu-kirildi-okul-yonetimi-ambulans-cagirmadi';
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000, httpsAgent });
    fs.writeFileSync('iha_video_detail.html', response.data);
    console.log("IHA Video Detail HTML saved");
}
downloadIHAHTML();
