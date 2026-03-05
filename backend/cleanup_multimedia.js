const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        console.log('--- CLEANING UP DUPLICATE MULTIMEDIA ---');

        // 1. Clean Videos
        const videos = await prisma.video.findMany();
        const seenVideos = new Set();
        let videoDupes = 0;
        for (const v of videos) {
            const key = v.original_url || v.video_url || v.title;
            if (seenVideos.has(key)) {
                await prisma.video.delete({ where: { id: v.id } });
                videoDupes++;
            } else {
                seenVideos.add(key);
            }
        }
        console.log(`Deleted ${videoDupes} duplicate videos.`);

        // 2. Clean Photo Galleries
        const galleries = await prisma.photoGallery.findMany();
        const seenGalleries = new Set();
        let galleryDupes = 0;
        for (const g of galleries) {
            const key = g.original_url || g.slug || g.title;
            if (seenGalleries.has(key)) {
                // Must delete associated images first if not cascade
                await prisma.photoGalleryImage.deleteMany({ where: { photo_gallery_id: g.id } });
                await prisma.photoGallery.delete({ where: { id: g.id } });
                galleryDupes++;
            } else {
                seenGalleries.add(key);
            }
        }
        console.log(`Deleted ${galleryDupes} duplicate galleries.`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
