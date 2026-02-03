import jsPDF from 'jspdf';

/**
 * PDF oluşturma fonksiyonu
 * @param {Object} newsletterData - Bülten verisi (subject, content)
 * @returns {Blob} PDF blob
 */
export const generateNewsletterPDF = (newsletterData) => {
    try {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('HABERFONI BÜLTEN', 105, 20, { align: 'center' });

        // Subject
        doc.setFontSize(14);
        doc.text(newsletterData.subject, 105, 35, { align: 'center' });

        // Date
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const date = new Date().toLocaleDateString('tr-TR');
        doc.text(date, 105, 45, { align: 'center' });

        // Line separator
        doc.line(20, 50, 190, 50);

        // Content
        doc.setFontSize(11);
        const splitContent = doc.splitTextToSize(newsletterData.content, 170);
        doc.text(splitContent, 20, 60);

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Haberfoni © ${new Date().getFullYear()}`, 105, 285, { align: 'center' });
            doc.text(`Sayfa ${i} / ${pageCount}`, 190, 285, { align: 'right' });
        }

        // Return as blob
        return doc.output('blob');
    } catch (error) {
        console.error('PDF generation error:', error);
        throw new Error('PDF oluşturulurken hata oluştu.');
    }
};

/**
 * PDF'i base64'e çevirme
 * @param {Blob} blob - PDF blob
 * @returns {Promise<string>} Base64 string
 */
export const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Tek bir aboneye mail gönderme (Edge Function kullanarak)
 * @param {string} email - Abone email adresi
 * @param {Object} newsletterData - Bülten verisi
 * @param {string} pdfBase64 - PDF base64 string
 * @returns {Promise<Object>} Gönderim sonucu
 */
const sendEmailToSubscriber = async (email, newsletterData, pdfBase64) => {
    const EDGE_FUNCTION_URL = 'https://lvbyxrinwkzcjzvbozfu.supabase.co/functions/v1/resend-email';

    try {
        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscnhwbnppaHNqdWduZGJndnJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MzY2ODMsImV4cCI6MjA4MDUxMjY4M30.SeWT_Jc4SrM5WWsaK1Ss3Ry36rdHatq1GoUyfqVJD5o',
            },
            body: JSON.stringify({
                email: email,
                subject: newsletterData.subject,
                content: newsletterData.content,
                pdfBase64: pdfBase64
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Mail gönderilemedi');
        }

        return await response.json();
    } catch (error) {
        console.error('Email send error:', error);
        throw error;
    }
};

/**
 * Tüm abonelere toplu mail gönderme
 * @param {Array} subscribers - Abone listesi
 * @param {Object} newsletterData - Bülten verisi
 * @param {Function} onProgress - İlerleme callback (opsiyonel)
 * @returns {Promise<Object>} Gönderim istatistikleri
 */
export const sendNewsletterToSubscribers = async (subscribers, newsletterData, onProgress) => {
    if (!subscribers || subscribers.length === 0) {
        throw new Error('Abone listesi boş.');
    }

    // PDF oluştur
    const pdfBlob = generateNewsletterPDF(newsletterData);
    const pdfBase64 = await blobToBase64(pdfBlob);

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Her aboneye sırayla gönder (rate limiting için)
    for (let i = 0; i < subscribers.length; i++) {
        const subscriber = subscribers[i];

        try {
            await sendEmailToSubscriber(subscriber.email, newsletterData, pdfBase64);
            successCount++;

            // İlerleme callback'i varsa çağır
            if (onProgress) {
                onProgress({
                    current: i + 1,
                    total: subscribers.length,
                    successCount,
                    failCount,
                    currentEmail: subscriber.email
                });
            }

            // Rate limiting: Her mail arasında kısa bir bekleme
            if (i < subscribers.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            failCount++;
            errors.push({
                email: subscriber.email,
                error: error.message
            });
            console.error(`Failed to send to ${subscriber.email}:`, error);
        }
    }

    return {
        total: subscribers.length,
        successCount,
        failCount,
        errors
    };
};

/**
 * Test maili gönderme
 * @param {string} testEmail - Test email adresi
 * @param {Object} newsletterData - Bülten verisi
 * @returns {Promise<Object>} Gönderim sonucu
 */
export const sendTestNewsletter = async (testEmail, newsletterData) => {
    const pdfBlob = generateNewsletterPDF(newsletterData);
    const pdfBase64 = await blobToBase64(pdfBlob);

    return await sendEmailToSubscriber(testEmail, newsletterData, pdfBase64);
};
