
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Group by category name
    const distribution = await prisma.news.groupBy({
        by: ['category'],
        _count: {
            category: true,
        },
    });

    console.log('Category Distribution:');
    distribution.forEach(d => console.log(`${d.category}: ${d._count.category}`));

    console.log('\nSamples:');
    const samples = await prisma.news.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        select: { id: true, title: true, category: true, category_id: true }
    });
    samples.forEach(s => console.log(`${s.id} - ${s.category} (ID: ${s.category_id}) - ${s.title.substring(0, 50)}...`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
