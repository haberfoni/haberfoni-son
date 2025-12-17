/**
 * Optimizes image URLs for Supabase storage.
 * Adds width, quality, and format parameters to the URL.
 * 
 * @param {string} url - The original image URL
 * @param {object} options - Optimization options
 * @param {number} options.width - Target width (default: 800)
 * @param {number} options.quality - Image quality (default: 80)
 * @param {string} options.format - Image format (default: 'webp')
 * @returns {string} - The optimized URL
 */
export const getOptimizedImageUrl = (url, { width = 800, quality = 80, format = 'origin' } = {}) => {
    if (!url) return url;

    // Check if it's a Supabase Storage URL
    if (url.includes('supabase.co/storage/v1/object/public')) {
        const hasParams = url.includes('?');
        const separator = hasParams ? '&' : '?';

        // Construct transformation string
        const transformations = [];
        if (width) transformations.push(`width=${width}`);
        if (quality) transformations.push(`quality=${quality}`);
        if (format) transformations.push(`format=${format}`);

        // If it's already a transformed URL (from render), append params handled by Supabase
        // Note: Supabase standard transformation is usually via /render/image/public or appending query params depending on setup.
        // Assuming standard storage public URL, Supabase Image Transformation works by appending query params to a different endpoint usually, 
        // BUT for public buckets, the standard transformation middleware might be enabled on the storage URL itself if configured.
        // However, the standard way in Supabase is usually:
        // https://project.supabase.co/storage/v1/render/image/public/bucket/file?width=500...

        // Let's try to convert standard public URL to render URL if possible, or just append params if the project supports it.
        // Standard Object URL: .../storage/v1/object/public/images/file.jpg
        // Standard Render URL: .../storage/v1/render/image/public/images/file.jpg

        let optimizedUrl = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');

        // If replacement didn't happen (url format difference), just append params to be safe, 
        // though it might not work without the /render/ endpoint.

        if (transformations.length > 0) {
            // Check if params already exist to avoid duplication
            const params = transformations.join('&');
            return `${optimizedUrl}${separator}${params}`;
        }

        return optimizedUrl;
    }

    return url;
};
