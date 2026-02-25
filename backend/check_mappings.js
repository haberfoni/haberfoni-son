
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mappings = await prisma.botCategoryMapping.findMany();
    console.log('--- ALL MAPPINGS ---');
    console.table(mappings);

    const settings = await prisma.botSetting.findMany();
    console.log('--- BOT SETTINGS ---');
    console.table(settings);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
