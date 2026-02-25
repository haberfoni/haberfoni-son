const Parser = require('rss-parser');
const parser = new Parser();

async function main() {
    const url = 'https://www.aa.com.tr/tr/rss/default?cat=guncel';
    const feed = await parser.parseURL(url);
    console.log(JSON.stringify(feed.items[0], null, 2));
}

main().catch(console.error);
