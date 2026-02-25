const Parser = require('rss-parser');
const parser = new Parser();

async function test() {
    console.log("Fetching IHA RSS...");
    const feed = await parser.parseURL('https://www.iha.com.tr/rss');
    if (feed.items.length > 0) {
        const item = feed.items[0];
        console.log("TITLE:", item.title);
        console.log("LINK:", item.link);
        console.log("CONTENT:", item.content);
        console.log("CONTENT SNIPPET:", item.contentSnippet);
    }
}
test().catch(console.error);
