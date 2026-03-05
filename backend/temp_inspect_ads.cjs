
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const ads = await prisma.ad.findMany();
    ads.forEach(ad => {
        console.log(`ID: ${ad.id} | Name: ${ad.name} | Type: ${ad.type}`);
        console.log(`  Img: ${ad.image_url}`);
        console.log(`  Code: ${ad.code ? ad.code.substring(0, 100) : 'null'}`);
        console.log('---');
    });
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
