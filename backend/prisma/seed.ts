
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Categories
    const categories = [
        { name: 'Gündem', slug: 'gundem', order_index: 1 },
        { name: 'Spor', slug: 'spor', order_index: 2 },
        { name: 'Ekonomi', slug: 'ekonomi', order_index: 3 },
        { name: 'Dünya', slug: 'dunya', order_index: 4 },
        { name: 'Teknoloji', slug: 'teknoloji', order_index: 5 },
        { name: 'Sağlık', slug: 'saglik', order_index: 6 },
        { name: 'Magazin', slug: 'magazin', order_index: 7 },
        { name: 'Yaşam', slug: 'yasam', order_index: 8 },
        { name: 'Kültür Sanat', slug: 'kultur-sanat', order_index: 9 },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }
    console.log('Categories seeded.');

    // 2. Bot Settings
    const botSettings = [
        { source_name: 'AA', is_active: true, auto_publish: true, daily_limit: 100 },
        { source_name: 'IHA', is_active: false, auto_publish: false, daily_limit: 50 }, // Disabled for now
        { source_name: 'DHA', is_active: false, auto_publish: false, daily_limit: 50 }, // Disabled for now
    ];

    for (const setting of botSettings) {
        const existing = await prisma.botSetting.findUnique({ where: { source_name: setting.source_name } });
        if (!existing) {
            await prisma.botSetting.create({ data: setting });
        }
    }
    console.log('Bot Settings seeded.');

    // 3. Bot Category Mappings (AA RSS)
    // Ensure we map to existing category slugs
    const mappings = [
        { source_name: 'AA', source_url: 'https://www.aa.com.tr/tr/rss/default?cat=guncel', target_category: 'gundem', is_active: true },
        { source_name: 'AA', source_url: 'https://www.aa.com.tr/tr/rss/default?cat=ekonomi', target_category: 'ekonomi', is_active: true },
        { source_name: 'AA', source_url: 'https://www.aa.com.tr/tr/rss/default?cat=spor', target_category: 'spor', is_active: true },
        { source_name: 'AA', source_url: 'https://www.aa.com.tr/tr/rss/default?cat=dunya', target_category: 'dunya', is_active: true },
        { source_name: 'AA', source_url: 'https://www.aa.com.tr/tr/rss/default?cat=bilim-teknoloji', target_category: 'teknoloji', is_active: true },
        { source_name: 'AA', source_url: 'https://www.aa.com.tr/tr/rss/default?cat=saglik', target_category: 'saglik', is_active: true },
        { source_name: 'AA', source_url: 'https://www.aa.com.tr/tr/rss/default?cat=yasam', target_category: 'yasam', is_active: true },
        { source_name: 'AA', source_url: 'https://www.aa.com.tr/tr/rss/default?cat=kultur-sanat', target_category: 'kultur-sanat', is_active: true },
    ];

    for (const map of mappings) {
        await prisma.botCategoryMapping.upsert({
            where: { source_url: map.source_url },
            update: {},
            create: map
        });
    }
    console.log('Bot Mappings seeded.');

    // 4. Create Admin User (Optional, if auth exists)
    // ...

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
