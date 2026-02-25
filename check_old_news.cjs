const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkOldNews() {
    try {
        const news = await prisma.news.findMany({
            where: {
                category: {
                    in: ['teknoloji', 'saglik', 'kultur-sanat']
                }
            },
            select: { id: true, title: true, category: true, source: true }
        });
        console.table(news);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkOldNews();
