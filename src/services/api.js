import apiClient from './apiClient';
import { newsItems, categories, sliderItems, financialData, videoGalleryItems, photoGalleryItems } from '../data/mockData';
import { slugify } from '../utils/slugify';

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Categories
export const fetchCategories = async () => {
    try {
        const response = await apiClient.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

// News
export const fetchNews = async () => {
    try {
        // Fetch more initially to allow safe filtering
        const response = await apiClient.get('/news?limit=100');
        const data = response.data.data || [];
        // Strictly filter out any news without an image
        const validNews = data.filter(item => item.image_url && item.image_url.trim() !== '');
        return validNews.slice(0, 30);
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
};

export const fetchSliderNews = async () => {
    // Subsumed by fetchHeadlines, kept for backwards compatibility
    return fetchHeadlines();
};

export const fetchHeadlines = async () => {
    // Simplified for migration: Just return latest news
    // TODO: Implement proper HeadlineService in backend
    try {
        const response = await apiClient.get('/news', { params: { limit: 30, isSlider: 'true' } });
        const itemsWithImages = response.data.data.filter(item => item.image_url && item.image_url.trim() !== '');

        return itemsWithImages.slice(0, 15).map((item, index) => ({
            ...item,
            order_index: index + 1,
            type: 'news'
        }));
    } catch (error) {
        console.error('Error fetching headlines:', error);
        return [];
    }
};

export const fetchSurmanset = async () => {
    try {
        const response = await apiClient.get('/news', { params: { limit: 30, page: 2 } }); // Fetch more since we'll filter
        // Filter out news without an image
        const itemsWithImages = response.data.data.filter(item => item.image_url && item.image_url.trim() !== '');

        return itemsWithImages.slice(0, 15).map((item, index) => ({
            ...item,
            order_index: index + 1,
            type: 'news'
        }));
    } catch (error) {
        return [];
    }
};

export const fetchNewsByCategory = async (categorySlug) => {
    try {
        const response = await apiClient.get('/news', {
            params: { category: categorySlug, limit: 100 } // Over-fetch to filter
        });
        const data = response.data.data || [];
        // Strictly filter out any news without an image
        const validNews = data.filter(item => item.image_url && item.image_url.trim() !== '');
        return validNews.slice(0, 20);
    } catch (error) {
        console.error('Error fetching news by category:', error);
        return [];
    }
};

export const fetchPopularNews = async (limit = 100) => {
    // Popularity not yet implemented in backend sorting (backend sorts by published_at)
    // For now, fetch latest
    try {
        const response = await apiClient.get('/news', {
            params: { limit: limit * 2 } // Over-fetch to filter
        });
        const data = response.data.data || [];
        const validNews = data.filter(item => item.image_url && item.image_url.trim() !== '');
        return validNews.slice(0, limit);
    } catch (error) {
        return [];
    }
};

export const fetchNewsDetail = async (id) => {
    try {
        const response = await apiClient.get(`/news/${id}`);
        const data = response.data;
        // Transform nested Category/AuthorRelation if needed, but Prisma returns object relation
        // Frontend expects 'tags' as array. Our backend returns tags in next steps.
        // For now, return data directly or map it.
        return data;
    } catch (error) {
        console.error('Error fetching news detail:', error);
        return null;
    }
};

export const fetchNewsByTag = async (tagSlug) => {
    // ... Tag service not implemented yet ...
    // Keeping old logic for now or returning empty
    return { name: '', news: [] };
};

export const fetchNewsBySlug = async (slug, categorySlug) => {
    try {
        // Backend endpoint: /news/slug/:slug
        const response = await apiClient.get(`/news/slug/${slug}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching news by slug:', error);
        return null;
    }
};


export const fetchNewsByTitleSlug = async (slug, category) => {
    // Legacy logic, better to use fetchNewsBySlug directly
    const news = await fetchNewsBySlug(slug);
    if (news && news.category === category) return news;
    return null;
}

export const searchNews = async (query) => {
    try {
        const response = await apiClient.get('/news', {
            params: { search: query }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error searching news:', error);
        return [];
    }
};

export const searchVideos = async (query) => {
    // Video service implementation pending
    return [];
};

export const searchPhotoGalleries = async (query) => {
    // Photo Gallery implementation pending
    return [];
};

export const fetchRelatedNews = async (excludeId) => {
    try {
        const response = await apiClient.get('/news', {
            params: { limit: 20 } // Fetch more to safely filter
        });
        const data = response.data.data || [];
        // Filter out the excluded ID AND items that don't have an image_url
        const validNews = data.filter(n => n.id !== excludeId && n.image_url && n.image_url.trim() !== '');
        return validNews.slice(0, 4);
    } catch (error) {
        return [];
    }
};

// Financial Data
export const fetchFinancialData = async () => {
    await delay(300);
    return financialData;
};

// Video Gallery
export const fetchVideoGalleries = async (page = 1, limit = 20) => {
    try {
        const response = await apiClient.get('/videos', {
            params: { page, limit, status: 'published' }
        });
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching video galleries:', error);
        return [];
    }
};

export const fetchHomeVideos = async () => {
    const videos = await fetchVideoGalleries(1, 4);
    return videos;
};

export const fetchVideoDetail = async (id) => {
    try {
        const response = await apiClient.get(`/videos/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching video detail ${id}:`, error);
        return null;
    }
};

// Photo Gallery
export const fetchPhotoGalleries = async (page = 1, limit = 20) => {
    try {
        const response = await apiClient.get('/galleries', {
            params: { page, limit, status: 'published' }
        });
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching photo galleries:', error);
        return [];
    }
};

export const fetchHomePhotoGalleries = async () => {
    const galleries = await fetchPhotoGalleries(1, 4);
    return galleries;
};

export const fetchPhotoGalleryDetail = async (id) => {
    try {
        const response = await apiClient.get(`/galleries/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching photo gallery detail ${id}:`, error);
        return null;
    }
};

export const fetchGalleryImages = async (galleryId) => {
    try {
        const response = await apiClient.get(`/galleries/${galleryId}/images`);
        return response.data || [];
    } catch (error) {
        console.error(`Error fetching gallery images for ${galleryId}:`, error);
        return [];
    }
};

// Subscribers
export const subscribeEmail = async (email) => {
    try {
        const res = await apiClient.post('/subscribers', { email });
        return res.data;
    } catch (error) {
        throw new Error('Abonelik servisi şu an kullanılamıyor.');
    }
};

// Ad Placements
export const fetchAdPlacements = async () => {
    try {
        const response = await apiClient.get('/ads');
        return Array.isArray(response.data) ? response.data.filter(ad => ad.is_active) : [];
    } catch (error) {
        console.error('Error fetching ad placements:', error);
        return [];
    }
};

export const fetchAdByPlacementCode = async (placementCode) => {
    try {
        const response = await apiClient.get('/ads');
        const ads = Array.isArray(response.data) ? response.data : [];
        return ads.find(ad => ad.placement_code === placementCode && ad.is_active) || null;
    } catch (error) {
        console.error('Error fetching ad by placement code:', error);
        return null;
    }
};

export const incrementNewsViews = async (id) => {
    try {
        await apiClient.post(`/news/${id}/increment-views`);
    } catch (error) {
        console.error('Error tracking view:', error);
    }
};

export const incrementVideoView = async (id) => {
    try {
        await apiClient.post(`/videos/${id}/increment-views`);
    } catch (error) {
        console.error('Error tracking video view:', error);
    }
};

export const incrementPhotoGalleryView = async (id) => {
    try {
        await apiClient.post(`/galleries/${id}/increment-views`);
    } catch (error) {
        console.error('Error tracking gallery view:', error);
    }
};

// Alias for backward compatibility
export const incrementNewsView = incrementNewsViews;

// Comments
export const fetchComments = async (newsId) => {
    try {
        const response = await apiClient.get('/comments', {
            params: { news_id: newsId, is_approved: true }
        });
        return response.data || [];
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
};

export const submitComment = async (comment) => {
    try {
        const response = await apiClient.post('/comments', comment);
        return response.data;
    } catch (error) {
        console.error('Error submitting comment:', error);
        throw new Error('Yorum servisi şu an kullanılamıyor.');
    }
};

// Aliases for backward compatibility
export const fetchPhotoGallery = fetchPhotoGalleries;
export const fetchVideoGallery = fetchVideoGalleries;
export const fetchVideos = fetchVideoGalleries;
// Newsletter
export const subscribeNewsletter = async (email) => {
    try {
        const response = await apiClient.post('/subscribers', { email });
        return response.data;
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        throw error;
    }
};

// Auth
export const login = async (email, password) => {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};
