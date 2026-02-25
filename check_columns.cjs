const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("Checking mappings and columns...");

    // Dump raw table to see exact columns
    const rawMappings = await prisma.$queryRaw`SELECT * FROM bot_category_mappings`;
    console.log("Raw Mappings from DB:");
    console.table(rawMappings);

}

check().catch(console.error).finally(() => prisma.$disconnect());
