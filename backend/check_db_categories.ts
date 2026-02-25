
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- Categories in DB ---');
    const categories = await prisma.category.findMany({ select: { id: true, name: true, slug: true } });
    console.table(categories);

    console.log('\n--- Bot Mappings ---');
    const mappings = await prisma.botCategoryMapping.findMany({ select: { source_name: true, target_category: true, source_url: true } });
    console.table(mappings);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
