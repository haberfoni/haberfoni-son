const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function downloadHTML() {
    const url = 'https://www.dha.com.tr/video/kamyonun-park-halindeki-araclarin-uzerine-devrildigi-kaza-kamerada-video-2830238';
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    fs.writeFileSync('dha_video.html', response.data);
    console.log("DHA Video HTML saved");
}
downloadHTML();
