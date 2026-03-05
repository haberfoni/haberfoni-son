
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ads = await prisma.ad.findMany();
    console.log('--- ALL ADS ---');
    ads.forEach(ad => {
        console.log(`ID: ${ad.id} | Name: ${ad.name} | Type: ${ad.type} | Active: ${ad.is_active} | Placement: ${ad.placement_code}`);
    });

    // Specifically looking for the ones mentioned or suspicious
    const suspicious = ads.filter(ad =>
        ad.name.includes('gsfs') ||
        (ad.code && ad.code.includes('js')) ||
        !ad.image_url && ad.type === 'image'
    );

    console.log('\n--- SUSPICIOUS ADS ---');
    suspicious.forEach(ad => {
        console.log(`ID: ${ad.id} | Name: ${ad.name}`);
    });
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
