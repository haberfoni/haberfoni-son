const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkContentLength() {
    const item = await prisma.news.findFirst({
        where: { source: 'IHA', category: 'spor' },
        orderBy: { id: 'desc' }
    });

    if (item) {
        console.log(`Title: ${item.title}`);
        console.log(`Category: ${item.category}`);
        console.log(`Summary length: ${item.summary.length}`);
        console.log(`Content length: ${item.content.length}`);
        console.log("------------------------");
        console.log("Snippet:", item.content.substring(0, 500) + "...");
    } else {
        console.log("No items found.");
    }
}

checkContentLength().catch(console.error).finally(() => prisma.$disconnect());
