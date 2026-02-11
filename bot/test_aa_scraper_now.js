import { scrapeAA } from './src/scrapers/aa.js';

console.log('=== Running AA Scraper with Media Filter ===\n');
console.log('This will scrape AA news and filter out photo/video/infographic content.\n');

await scrapeAA();

console.log('\n=== Scraping Complete ===');
console.log('Check the output above to verify that media content was filtered.');
