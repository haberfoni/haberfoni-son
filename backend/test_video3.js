const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function scrapeDHAVideo(url) {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        const $ = cheerio.load(response.data);

        const title = $('h1').first().text().trim();
        let description = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') || '';
        const thumbnail = $('meta[property="og:image"]').attr('content') || '';

        let videoUrl = $('video source').attr('src') || $('video').attr('src') ||
            $('meta[property="og:video:url"]').attr('content') ||
            $('meta[property="og:video:secure_url"]').attr('content') ||
            $('meta[property="og:video"]').attr('content') ||
            $('meta[name="twitter:player"]').attr('content') ||
            $('iframe[src*="dha.com.tr/video"]').attr('src') ||
            $('iframe[src*="youtube"]').attr('src') || '';

        if (!videoUrl) {
            // Try to extract from LD+JSON
            $('script[type="application/ld+json"]').each((i, el) => {
                try {
                    const json = JSON.parse($(el).html());
                    if (json && json['@type'] === 'VideoObject' && json.embedUrl) {
                        videoUrl = json.embedUrl;
                    }
                } catch (e) { }
            });
        }

        if (!videoUrl) {
            // Try quarkPlayer sources
            const html = response.data;
            const match = html.match(/embedUrl:\s*'([^']+)'/);
            if (match) {
                videoUrl = match[1];
            }
        }

        if (!videoUrl) {
            // Try direct m3u8 source
            const m3u8Match = response.data.match(/src:\s*'([^']+playlist\.m3u8[^']*)'/);
            if (m3u8Match) {
                videoUrl = m3u8Match[1];
            }
        }

        const finalTitle = title || $('meta[property="og:title"]').attr('content') || $('title').text().trim();

        console.log("Extracted DHA:", { title: finalTitle, videoUrl, thumbnail });
    } catch (e) {
        console.error("Error Video:", e.message);
    }
}

async function testDHA() {
    const url = 'https://www.dha.com.tr/video/kamyonun-park-halindeki-araclarin-uzerine-devrildigi-kaza-kamerada-video-2830238';
    await scrapeDHAVideo(url);
}

testDHA();
