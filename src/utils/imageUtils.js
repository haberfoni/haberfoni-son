export const getOptimizedImageUrl = (url, { width = 800, quality = 80, format = 'webp' } = {}) => {
    if (!url) return url;
    // optimization disabled due to supabase render endpoint unavailable
    return url;
};
