const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    const genericTitles = ['Video', 'VIDEO', 'video', 'Video Galeri', 'VIDEO GALERİ', 'video galeri', 'Haber', 'HABER', 'haber'];
    
    console.log('Cleaning generic videos...');
    const deletedVideos = await prisma.video.deleteMany({
        where: {
            title: {
                in: genericTitles
            }
        }
    });
    console.log(`Deleted ${deletedVideos.count} generic videos.`);

    console.log('Cleaning generic galleries...');
    const deletedGalleries = await prisma.photoGallery.deleteMany({
        where: {
            title: {
                in: genericTitles
            }
        }
    });
    console.log(`Deleted ${deletedGalleries.count} generic galleries.`);

    console.log('Cleaning generic news...');
    const deletedNews = await prisma.news.deleteMany({
        where: {
            title: {
                in: genericTitles
            }
        }
    });
    console.log(`Deleted ${deletedNews.count} generic news.`);

    process.exit(0);
}

clean().catch(err => {
    console.error(err);
    process.exit(1);
});
