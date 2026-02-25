const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("Checking mappings and recent news categories...");

    const mappings = await prisma.botCategoryMapping.findMany({
        where: { is_active: true },
        select: { source_name: true, target_category: true, source_url: true }
    });
    console.log("ACTIVE USER MAPPINGS (What user selected):");
    console.table(mappings);

    const recentNews = await prisma.news.groupBy({
        by: ['category', 'source'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
    });
    console.log("RECENT NEWS DISTRIBUTION (What is actually saved):");
    console.table(recentNews);
}

check().catch(console.error).finally(() => prisma.$disconnect());
