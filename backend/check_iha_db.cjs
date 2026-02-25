const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const news = await prisma.news.findMany({
        where: { source: 'IHA' },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: { id: true, title: true, image_url: true, summary: true }
    });

    for (const n of news) {
        console.log('---');
        console.log('ID:', n.id);
        console.log('Title:', n.title?.substring(0, 60));
        console.log('Image URL:', n.image_url);
        console.log('Summary (50 chars):', n.summary?.substring(0, 80));
    }
    await prisma.$disconnect();
}
main().catch(console.error);
