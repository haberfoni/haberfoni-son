const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:3000' : 'http://142.132.229.92:3000');

export const getOptimizedImageUrl = (url, { width = 800, quality = 80, format = 'webp' } = {}) => {
    if (!url) return url;

    // If it's a relative upload path, make it absolute using the API base URL
    if (typeof url === 'string') {
        if (url.startsWith('/uploads/')) {
            return `${API_BASE}${url}`;
        }
        if (url.startsWith('uploads/')) {
            return `${API_BASE}/${url}`;
        }
    }

    // optimization disabled
    return url;
};
