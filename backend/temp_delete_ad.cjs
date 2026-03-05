
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ad12 = await prisma.ad.findUnique({ where: { id: 12 } });
    if (ad12) {
        await prisma.ad.delete({ where: { id: 12 } });
        console.log('Deleted ad ID 12');
    } else {
        console.log('Ad ID 12 not found');
    }
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
