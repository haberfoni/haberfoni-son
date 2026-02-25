const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
    try {
        const groups = await prisma.news.groupBy({
            by: ['category'],
            _count: { id: true }
        });
        console.table(groups);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkCategories();
