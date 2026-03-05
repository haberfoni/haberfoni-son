const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        const galleries = await prisma.photoGallery.findMany({
            include: { gallery_images: true },
            orderBy: { created_at: 'desc' },
            take: 5
        });
        console.log(`LATEST GALLERIES:`);
        galleries.forEach(g => {
            console.log(`- [${g.id}] ${g.title} | Source: ${g.source} | Images: ${g.gallery_images.length} | Desc: ${g.description?.substring(0, 50)}...`);
        });

        const videos = await prisma.video.findMany({
            orderBy: { created_at: 'desc' },
            take: 5
        });
        console.log(`\nLATEST VIDEOS:`);
        videos.forEach(v => {
            console.log(`- [${v.id}] ${v.title} | Source: ${v.source} | Desc: ${v.description?.substring(0, 50)}...`);
        });

        const commands = await prisma.botCommand.findMany({
            orderBy: { created_at: 'desc' },
            take: 3
        });
        console.log('\nLATEST COMMANDS:');
        commands.forEach(c => console.log(`- [${c.id}] ${c.command} | Status: ${c.status} | Created: ${c.created_at}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
