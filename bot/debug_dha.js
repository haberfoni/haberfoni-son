
import Parser from 'rss-parser';
const parser = new Parser();

async function test() {
    console.log('Testing DHA URL: https://www.dha.com.tr/spor');
    try {
        const feed = await parser.parseURL('https://www.dha.com.tr/spor');
        console.log('Success! Feed title:', feed.title);
        console.log('Item count:', feed.items.length);
    } catch (err) {
        console.error('RSS Parsing Failed:', err.message);
    }
}

test();
