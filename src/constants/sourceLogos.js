export const SOURCE_LOGOS = {
    'AA': 'https://upload.wikimedia.org/wikipedia/commons/0/00/Anadolu_Agency_logo.svg',
    'IHA': 'https://upload.wikimedia.org/wikipedia/commons/e/e6/%C4%B0hlas_Haber_Ajans%C4%B1_Logo.png',
    'DHA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Demir%C3%B6ren_Haber_Ajans%C4%B1_logo.svg/320px-Demir%C3%B6ren_Haber_Ajans%C4%B1_logo.svg.png',
    'ANKA': 'https://anka.com.tr/assets/img/logo.svg' // Fallback/Guess
};

export const getSourceLogo = (source) => {
    if (!source) return null;
    // Normalize source name (uppercase)
    const normalized = source.toUpperCase();
    return SOURCE_LOGOS[normalized] || null;
};
