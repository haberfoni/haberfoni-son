const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function fixData() {
    console.log("Starting data cleanup...");

    try {
        // 1. Delete all items from the DB that are from the bot 
        // because they either have wrong categories or truncated text.
        // It's safer to let the bot just re-fetch them perfectly.
        const deleted = await prisma.news.deleteMany({
            where: {
                source: {
                    in: ['AA', 'IHA', 'DHA']
                }
            }
        });

        console.log(`Deleted ${deleted.count} old bot news items with incorrect categories or truncated text.`);

        // 2. Reset the bot mappings last_scraped_at so it pulls them immediately
        await prisma.botCategoryMapping.updateMany({
            data: {
                last_scraped_at: null,
                last_item_count: 0
            }
        });

        console.log("Reset bot mappings. The bot will re-fetch fresh, full-length articles into the correct categories on the next run.");

    } catch (error) {
        console.error("Error during cleanup:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fixData();
