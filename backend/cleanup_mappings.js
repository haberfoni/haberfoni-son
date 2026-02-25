const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // IHA için sadece Spor ve Kültür-Sanat kalacak
    const ihaToKeep = [
        'https://www.iha.com.tr/spor',
        'https://www.iha.com.tr/kultur-sanat'
    ];

    // IHA'nın diğer tüm mappinglerini sil
    const deletedIHA = await prisma.botCategoryMapping.deleteMany({
        where: {
            source_name: 'IHA',
            source_url: { notIn: ihaToKeep }
        }
    });

    console.log(`Deleted ${deletedIHA.count} unwanted IHA mappings.`);

    // DHA için tüm mappingleri sil (admin panelinde DHA yok)
    const deletedDHA = await prisma.botCategoryMapping.deleteMany({
        where: { source_name: 'DHA' }
    });

    console.log(`Deleted ${deletedDHA.count} DHA mappings.`);

    // Kalan mappingleri göster
    const remaining = await prisma.botCategoryMapping.findMany({
        where: { source_name: { in: ['IHA', 'DHA'] } }
    });

    console.log('\n--- Remaining IHA/DHA Mappings ---');
    console.table(remaining.map(m => ({
        source: m.source_name,
        url: m.source_url,
        category: m.target_category
    })));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
