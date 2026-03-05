
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const headlines = await prisma.headline.findMany({
        where: { type: 1 },
        include: { News: true }
    });
    console.log('--- PINNED NEWS SLIDER (TYPE 1) ---');
    headlines.forEach(h => {
        console.log(`ID: ${h.id} | Slot: ${h.order_index} | Title: ${h.News ? h.News.title : 'MISSING'}`);
    });
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
