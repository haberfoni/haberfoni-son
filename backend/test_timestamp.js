const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkTimestampBehavior() {
    console.log('--- Timestamp Behavior Test ---');
    try {
        const comment = await prisma.comment.create({
            data: {
                user_name: 'Time Test User',
                comment: 'Test content',
                news_id: 1,
                is_approved: false
            }
        });
        console.log('Created at:', comment.created_at);
        await new Promise(resolve => setTimeout(resolve, 2000));
        const updated = await prisma.comment.update({
            where: { id: comment.id },
            data: { is_approved: true }
        });
        console.log('Updated at (after approval):', updated.created_at);
        if (comment.created_at.getTime() === updated.created_at.getTime()) {
            console.log('RESULT: Timestamps match. Standard behavior.');
        } else {
            console.log('RESULT: Timestamps DIFF. DB is auto-updating created_at!');
        }
        await prisma.comment.delete({ where: { id: comment.id } });
    } catch (e) {
        console.error('Test error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
checkTimestampBehavior();
