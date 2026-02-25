
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const news = await prisma.news.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        select: { id: true, title: true, image_url: true, source: true, original_url: true }
    });
    console.log(JSON.stringify(news, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
