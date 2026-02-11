import axios from 'axios';
import * as cheerio from 'cheerio';

async function testCheerioSrc() {
    console.log('=== Testing Cheerio src attribute ===\n');

    // Fetch a real AA article
    const url = 'https://www.aa.com.tr/tr/dunya/iran-asilli-prof-nasrdan-iran-ve-abd-savas-tehdidini-diplomasiyi-sekillendirmek-icin-kullaniyor-iddias/3473925';

    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // Find all images in content
    $('.detay-icerik img').each((i, el) => {
        const $el = $(el);
        const src = $el.attr('src');
        const dataSrc = $el.attr('data-src');

        console.log(`\nImage ${i + 1}:`);
        console.log(`  src attr: ${src}`);
        console.log(`  data-src attr: ${dataSrc}`);

        const finalSrc = src || dataSrc;
        if (finalSrc) {
            console.log(`  Final src: ${finalSrc}`);
            console.log(`  Starts with '/': ${finalSrc.startsWith('/')}`);
            console.log(`  Includes %2F: ${finalSrc.includes('%2F')}`);
        }
    });
}

testCheerioSrc();
