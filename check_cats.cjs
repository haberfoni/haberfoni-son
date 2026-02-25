const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
    console.log("Checking categories table...");
    try {
        const categories = await prisma.category.findMany();
        console.table(categories);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkCategories();
