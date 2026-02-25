const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkNews() {
    const news = await prisma.news.findMany({
        orderBy: { id: 'desc' },
        take: 10,
        select: { id: true, title: true, published_at: true, is_slider: true, source: true }
    });
    console.table(news);
}

checkNews().catch(console.error).finally(() => prisma.$disconnect());
