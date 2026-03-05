const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const sliderCount = await prisma.news.count({ where: { is_slider: true } });
        const headlines = await prisma.headline.findMany({
            include: { News: true },
            orderBy: [{ type: 'asc' }, { order_index: 'asc' }]
        });
        const totalNews = await prisma.news.count();
        const latestNews = await prisma.news.findMany({
            take: 10,
            orderBy: { published_at: 'desc' },
            where: { is_active: true, published_at: { not: null } }
        });

        console.log(JSON.stringify({
            sliderCount,
            headlines: headlines.map(h => ({
                id: h.id,
                type: h.type,
                order_index: h.order_index,
                news_id: h.news_id,
                news_title: h.News?.title
            })),
            totalNews,
            latestNews: latestNews.map(n => ({ id: n.id, title: n.title, published_at: n.published_at }))
        }, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
