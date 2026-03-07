import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setFakeAiError() {
    try {
        const errorStatus = JSON.stringify({
            status: 'ERROR',
            message: 'TEST HATASI: Gemini API kotası doldu (Simüle Edildi)',
            timestamp: new Date()
        });

        await prisma.siteSetting.upsert({
            where: { key: 'AI_STATUS' },
            update: { value: errorStatus },
            create: { key: 'AI_STATUS', value: errorStatus }
        });

        console.log('BAŞARILI: Veritabanına sahte AI hatası eklendi.');
        console.log('Şimdi admin paneline girdiğinizde en üstte uyarıyı görmelisiniz.');
    } catch (error) {
        console.error('Hata:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

setFakeAiError();
