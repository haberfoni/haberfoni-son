
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ads = await prisma.$queryRaw`SELECT * FROM ads`;
    console.log('--- RAW ADS ---');
    console.log(JSON.stringify(ads, null, 2));
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
