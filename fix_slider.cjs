const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    console.log("Updating recent bot news to is_slider: true...");
    const result = await prisma.news.updateMany({
        where: { source: { in: ['AA', 'IHA', 'DHA'] } },
        data: { is_slider: true }
    });
    console.log(`Updated ${result.count} bot news items to be in the slider!`);
}

fix().catch(console.error).finally(() => {
    prisma.$disconnect();
    process.exit(0);
});
