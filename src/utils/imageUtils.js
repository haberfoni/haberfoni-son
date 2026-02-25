export const getOptimizedImageUrl = (url, { width = 800, quality = 80, format = 'webp' } = {}) => {
    if (!url) return url;
    // optimization disabled
    return url;
};
