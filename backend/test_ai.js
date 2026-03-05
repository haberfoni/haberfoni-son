
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let apiKey = '';
try {
    const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const match = env.match(/AI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (e) {}

async function testAi() {
    console.log('Testing gemini-pro-latest with key:', apiKey);
    if (!apiKey) return;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${apiKey}`;
    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: "Say 'Hello, I am gemini-pro-latest!'" }] }]
        });
        console.log('--- SUCCESS ---');
        console.log(response.data?.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (error) {
        console.error('Error:', error.response ? error.response.status : error.message);
        if (error.response && error.response.data) {
            console.error(JSON.stringify(error.response.data.error, null, 2));
        }
    }
}

testAi();
