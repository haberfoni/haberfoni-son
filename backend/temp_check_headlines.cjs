
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const headlines = await prisma.headline.findMany({
        include: { News: true }
    });
    console.log('--- HEADLINES ---');
    headlines.forEach(h => {
        console.log(`ID: ${h.id} | NewsID: ${h.news_id} | Type: ${h.type} | Order: ${h.order_index} | Title: ${h.News ? h.News.title : 'MISSING NEWS'}`);
    });
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
