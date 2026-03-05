const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const mappings = await prisma.botCategoryMapping.findMany();
    console.log("Mappings:");
    console.table(mappings);

    const videos = await prisma.video.findMany({ select: { id: true, source: true, title: true } });
    console.log("Videos:");
    console.table(videos);

    const settings = await prisma.botSetting.findMany();
    console.log("Settings:");
    console.table(settings);

    await prisma.$disconnect();
}
run();
