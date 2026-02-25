
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const latestNews = await prisma.news.findMany({
        take: 50,
        orderBy: { created_at: 'desc' },
        select: { id: true, category: true, created_at: true }
    });

    const categoryCounts: Record<string, number> = {};
    latestNews.forEach(n => {
        const cat = n.category || 'Uncategorized';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    console.log('Category Distribution of Latest 50 Items:');
    console.log(JSON.stringify(categoryCounts, null, 2));

    console.log('\nFirst 10 items:');
    latestNews.slice(0, 10).forEach(n => console.log(`${n.id} - ${n.category} - ${n.created_at}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
