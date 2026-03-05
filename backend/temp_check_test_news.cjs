
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const testNews = await prisma.news.findMany({
        where: {
            OR: [
                { title: { contains: 'gsfs' } },
                { title: { contains: 'test' } }
            ]
        }
    });
    console.log('--- TEST NEWS ---');
    testNews.forEach(n => {
        console.log(`ID: ${n.id} | Title: ${n.title}`);
    });
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
