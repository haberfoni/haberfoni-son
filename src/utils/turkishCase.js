/**
 * Türkçe karakterleri düzgün göstermek için capitalize fonksiyonu
 * "iş dünyası" -> "İş Dünyası"
 * Manuel tanımlama yok, tamamen otomatik.
 */
export const toTurkishTitleCase = (str) => {
    if (!str) return '';

    // Kelimelere ayır ve her birini capitalize et
    return str.split(' ').map(word => {
        if (word.length === 0) return '';
        // İlk harfi Türkçe locale ile büyüt, geri kalanı küçük kalsın
        return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLowerCase();
    }).join(' ');
};

/**
 * Kelime kelime capitalize et (toTurkishTitleCase ile aynı işlevi görür ama geriye dönük uyumluluk için tutuyoruz)
 */
export const toTurkishTitleCaseWords = (str) => {
    return toTurkishTitleCase(str);
};
