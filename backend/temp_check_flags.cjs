
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ad12 = await prisma.ad.findUnique({ where: { id: 12 } });
    console.log('--- AD 12 ---');
    console.log(JSON.stringify(ad12, null, 2));

    const allAds = await prisma.ad.findMany();
    console.log('\n--- ALL ADS FLAGS ---');
    allAds.forEach(ad => {
        console.log(`ID: ${ad.id} | Name: ${ad.name} | is_headline: ${ad.is_headline} | is_manset_2: ${ad.is_manset_2} | Placement: ${ad.placement_code}`);
    });
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
