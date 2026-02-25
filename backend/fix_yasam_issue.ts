
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Fixing Yaşam Issue ---');

    // 1. Delete Mapping
    const deleteMapping = await prisma.botCategoryMapping.deleteMany({
        where: { target_category: 'yasam' }
    });
    console.log(`Deleted ${deleteMapping.count} mappings for 'yasam'.`);

    // 2. Delete News
    // First, unlink ads
    const yasamNews = await prisma.news.findMany({ where: { category: 'yasam' }, select: { id: true } });
    const ids = yasamNews.map(n => n.id);

    if (ids.length > 0) {
        // Check if target_news_id is Int or String in schema
        // Assuming Int based on error, but let's cast safely
        // Actually, if it's Int, we should pass numbers.
        const intIds = ids.map(id => Number(id));
        await prisma.ad.updateMany({
            where: { target_news_id: { in: intIds } }, // Try int first
            data: { target_news_id: null }
        });

        const deleteNews = await prisma.news.deleteMany({
            where: { category: 'yasam' }
        });
        console.log(`Deleted ${deleteNews.count} news items for 'yasam'.`);
    } else {
        console.log('No news found for yasam.');
    }

    // 3. Delete Category (Optional, usually safe if no news)
    /*
    const deleteCat = await prisma.category.deleteMany({
        where: { slug: 'yasam' }
    });
    console.log(`Deleted ${deleteCat.count} category 'yasam'.`);
    */

    // 4. Update Site Settings (Layout) to remove 'Yaşam' if present? 
    // Usually layout is dynamic, but good to check. Leaving for now.

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
