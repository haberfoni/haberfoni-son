
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const activeSources = await prisma.news.groupBy({
        by: ['source'],
        _count: { id: true },
        where: { created_at: { gt: new Date(Date.now() - 1000 * 60 * 60) } } // Last hour
    });
    console.log('--- News Count (Last Hour) ---');
    console.table(activeSources);

    const ihaNews = await prisma.news.findMany({
        where: { source: 'IHA' },
        orderBy: { created_at: 'desc' },
        take: 5
    });
    console.log('--- Latest IHA News Details ---');
    console.table(ihaNews.map(n => ({
        id: n.id,
        title: n.title.substring(0, 20),
        url: n.image_url ? n.image_url.substring(0, 50) + '...' : 'NULL'
    })));

    const dhaNews = await prisma.news.findMany({
        where: { source: 'DHA' },
        orderBy: { created_at: 'desc' },
        take: 3
    });
    console.log('--- Latest DHA News ---');
    console.table(dhaNews.map(n => ({ id: n.id, title: n.title.substring(0, 30), created: n.created_at })));

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
