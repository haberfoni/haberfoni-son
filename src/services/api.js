import { supabase } from './supabase';
import { newsItems, categories, sliderItems, financialData, videoGalleryItems, photoGalleryItems } from '../data/mockData';
import { slugify } from '../utils/slugify';

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Categories
export const fetchCategories = async () => {
    // Return mock categories mapped to expected object structure
    // If mockData just exports strings, we map them. If objects, use as is.
    // mockData.js: export const categories = ["Medya", ...]
    return categories.map((cat, index) => ({
        id: index + 1,
        name: cat,
        slug: cat.toLowerCase().replace(/ /g, '-')
    }));
};

// News
export const fetchNews = async () => {
    const { data, error } = await supabase
        .from('news')
        .select('id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views')
        .not('published_at', 'is', null) // Only show published news
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching news:', error);
        return [];
    }
    return data;
};

export const fetchSliderNews = async () => {
    const { data, error } = await supabase
        .from('news')
        .select('id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views, is_slider')
        .eq('is_slider', true)
        .not('published_at', 'is', null) // Only show published news in slider
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching slider news:', error);
        return [];
    }
    return data;
};

export const fetchNewsByCategory = async (categorySlug) => {
    // Database categories are stored as lowercase slugs (e.g., 'gundem', 'spor')
    // So we can directly use the slug to query.
    const { data, error } = await supabase
        .from('news')
        .select('id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views')
        .eq('category', categorySlug)
        .not('published_at', 'is', null) // Only show published news
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching news by category:', error);
        return [];
    }
    return data;
};

export const fetchNewsDetail = async (id) => {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching news detail:', error);
        return null;
    }
    return data;
};

export const fetchNewsBySlug = async (slug, categorySlug) => {
    // Determine which column to match based on input
    // Supabase doesn't have a computed slug column yet, so we have to filter by title essentially or rely on client side matching if we can't find one.
    // However, fetching ONLY by category isn't enough.
    // Ideally we should switch to ID based routing or add a slug column.
    // FOR NOW: We will use the existing fetchNewsByCategory but verify if we can select content.
    // BUT fetching all category items with content is HEAVY.
    // OPTION: We fetch the single item by matching ALL items in category (light) then finding the ID, then fetching detail (heavy).

    // Step 1: Find ID from lightweight list (assuming we have list already or fetch it)
    // Actually, let's just fetch all from category with light data, find match, then fetch detail.
    // This is what NewsDetailPage effectively does but failed because it didn't fetch detail.

    return null; // Placeholder as logic is implemented in Component
};

export const fetchNewsByTitleSlug = async (slug, category) => {
    // 1. Fetch lightweight list of category to find the ID
    const { data: list, error } = await supabase
        .from('news')
        .select('id, title, category, slug')
        .eq('category', category);

    if (error) return null;

    // 2. Find matching item
    const match = list.find(item => slugify(item.title) === slug);
    if (!match) return null;

    // 3. Fetch full detail
    return await fetchNewsDetail(match.id);
}

export const searchNews = async (query) => {
    const { data, error } = await supabase
        .from('news')
        .select('id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching news:', error);
        return [];
    }
    return data;
};

export const fetchRelatedNews = async (excludeId) => {
    const { data, error } = await supabase
        .from('news')
        .select('id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views')
        .neq('id', excludeId)
        .order('created_at', { ascending: false })
        .limit(16);

    if (error) {
        console.error('Error fetching related news:', error);
        return [];
    }
    if (error) {
        console.error('Error fetching related news:', error);
        return [];
    }
    return data;
};

export const incrementNewsView = async (id) => {
    try {
        // 1. Get current views
        const { data, error } = await supabase
            .from('news')
            .select('views')
            .eq('id', id)
            .single();

        if (error) throw error;

        // 2. Increment
        const newViews = (data.views || 0) + 1;

        const { error: updateError } = await supabase
            .from('news')
            .update({ views: newViews })
            .eq('id', id);

        if (updateError) throw updateError;

    } catch (err) {
        console.error('Error incrementing view:', err);
    }
};

// Financial Data
export const fetchFinancialData = async () => {
    return financialData;
};

// Videos
export const fetchVideos = async () => {
    return videoGalleryItems;
};

// Photo Galleries
export const fetchPhotoGalleries = async () => {
    return photoGalleryItems;
};

export const fetchGalleryImages = async (galleryId) => {
    // Find gallery in mockData
    const gallery = photoGalleryItems.find(g => g.id == galleryId);
    if (!gallery || !gallery.images) return [];

    // Map string URLs to object structure if needed, or just return urls
    return gallery.images.map((url, index) => ({
        id: index,
        url: url,
        order_index: index,
        gallery_id: galleryId
    }));
};
