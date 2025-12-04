import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Mock Data (Copying relevant parts since we can't easily import ES modules in this script context without setup)
// In a real app, you would import this or fetch from API
const categories = [
    "Medya", "Gündem", "Politika", "Magazin", "Ekonomi", "Spor",
    "Dünya", "Teknoloji", "Sağlık", "Kültür Sanat", "Otomobil", "Emlak"
];

const newsItems = [
    { id: 101, title: "Teknoloji devinden yapay zeka hamlesi: Yeni asistan tanıtıldı", category: "Teknoloji", summary: "Dünyanın önde gelen teknoloji şirketi, bugün düzenlediği etkinlikte yeni yapay zeka asistanını tanıttı." },
    { id: 102, title: "Sağlıklı yaşam için 10 altın kural", category: "Sağlık", summary: "Uzmanlar sağlıklı bir yaşam için dikkat edilmesi gereken 10 temel kuralı sıraladı." },
    { id: 103, title: "Borsa günü yükselişle kapattı", category: "Ekonomi", summary: "BIST 100 endeksi günü %1.5 artışla tamamladı." },
    // ... Add more items if needed for full generation, for now using a subset for demo
];

const sliderItems = [
    { id: 1, title: "Merkez Bankası faiz kararını açıkladı: Piyasalar nasıl tepki verdi?", category: "Ekonomi" },
    { id: 2, title: "Süper Lig'de derbi heyecanı: Muhtemel 11'ler belli oldu", category: "Spor" },
    // ...
];

const allNews = [...sliderItems, ...newsItems];
const SITE_URL = 'https://haberfoni.com';

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

const generateSitemap = () => {
    const staticUrls = [
        '/',
        '/tum-haberler',
        '/hakkimizda',
        '/kunye',
        '/iletisim',
        '/reklam',
        '/kariyer',
        '/kvkk',
        '/cerez-politikasi',
        '/video-galeri',
        '/foto-galeri'
    ];

    const categoryUrls = categories.map(cat => `/kategori/${slugify(cat)}`);

    const newsUrls = allNews.map(item => `/kategori/${slugify(item.category)}/${slugify(item.title)}`);

    const allUrls = [...staticUrls, ...categoryUrls, ...newsUrls];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    return sitemap;
};

const generateRSS = () => {
    const rssItems = allNews.slice(0, 20).map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${SITE_URL}/kategori/${slugify(item.category)}/${slugify(item.title)}</link>
      <description><![CDATA[${item.summary || item.title}]]></description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid>${SITE_URL}/kategori/${slugify(item.category)}/${slugify(item.title)}</guid>
    </item>`).join('\n');

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Haberfoni</title>
  <link>${SITE_URL}</link>
  <description>Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri ve özel dosyalar Haberfoni'de.</description>
  <language>tr</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
</channel>
</rss>`;

    return rss;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '../public');

// Ensure public dir exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Write Sitemap
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), generateSitemap());
console.log('sitemap.xml generated');

// Write RSS
fs.writeFileSync(path.join(publicDir, 'rss.xml'), generateRSS());
console.log('rss.xml generated');
