import { supabase } from './supabase';
import { newsItems, categories, sliderItems, financialData, videoGalleryItems, photoGalleryItems } from '../data/mockData';
import { slugify } from '../utils/slugify';

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Categories
// Categories
export const fetchCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    return data;
};

// News
export const fetchNews = async () => {
    // Select * ensures we get all available columns. LIMIT 60 prevents freezing.
    // Optimized select to improve performance (excludes content)
    const { data, error } = await supabase
        .from('news')
        .select('id, title, image_url, slug, category, created_at, published_at, views')
        //.not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30);

    if (error) {
        console.error('Error fetching news:', error);
        return [];
    }
    return data;
};

export const fetchSliderNews = async () => {
    const { data, error } = await supabase
        .from('news')
        .select('id, title, image_url, slug, category, created_at, published_at, views, is_slider')
        .eq('is_slider', true)
        // .not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching slider news:', error);
        return [];
    }
    return data;
};

export const fetchHeadlines = async () => {
    // HYBRID: Manual headlines + Ads + Slider Ads + Auto-fill with latest 15 news
    const MAX_HEADLINES = 15;

    // 1. Fetch manual headlines with slot numbers
    // Removed specific select/type filter to debug
    const { data: manualHeadlines } = await supabase
        .from('headlines')
        .select(`
            slot_number,
            news:news_id (id, title, image_url, slug, category, created_at, published_at, views)
        `)
        //.not('news.published_at', 'is', null)
        .order('slot_number', { ascending: true });

    // 2. Fetch headline ads (from ads table)
    const { data: headlineAds } = await supabase
        .from('ads')
        .select('id, name, title, image_url, link_url, placement_code, is_headline, headline_slot, is_active, views, clicks')
        .eq('is_headline', true)
        .not('headline_slot', 'is', null)
        .order('headline_slot', { ascending: true });

    // 3. Fetch slider ads (from ads table)
    let sliderAds = [];
    try {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .eq('placement_code', 'headline_slider')
            .eq('is_headline', true)
            .not('headline_slot', 'is', null)
            .order('headline_slot', { ascending: true });

        if (error) {
            console.error('Supabase error fetching slider ads:', error);
        }

        sliderAds = data || [];
    } catch (error) {
        console.warn('Slider ads columns not available yet:', error);
    }

    // Create a map of slot_number -> content (news, ad, or slider-ad)
    const slotMap = new Map();
    const manualNewsIds = new Set();

    // Add manual headlines
    manualHeadlines?.forEach(h => {
        // Double check type to be safe, though query handles it
        if (h.news && (h.type === 1 || h.type === null)) {
            slotMap.set(h.slot_number, { ...h.news, type: 'news' });
            manualNewsIds.add(h.news.id);
        }
    });

    // Add ads from ads table
    headlineAds?.forEach(ad => {
        slotMap.set(ad.headline_slot, {
            ...ad,
            type: 'ad',
            title: ad.title || 'Reklam',
            image_url: ad.image_url,
            id: `ad-${ad.id}`,
            adId: ad.id
        });
    });

    // Add slider ads from ads table
    sliderAds?.forEach(ad => {
        slotMap.set(ad.headline_slot, {
            ...ad,
            type: 'slider-ad',
            title: ad.name || 'Slider Reklamı',
            image_url: ad.image_url,
            id: `slider-ad-${ad.id}`,
            adPlacementId: ad.id,
            link_url: ad.link_url
        });
    });

    // 4. Get latest news for auto-fill
    // Use select * to be safe
    const { data: latestNews } = await supabase
        .from('news')
        .select('id, title, image_url, slug, category, created_at, published_at, views')
        // .not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(MAX_HEADLINES + manualNewsIds.size);

    const autoNews = latestNews?.filter(n => !manualNewsIds.has(n.id)).map(n => ({ ...n, type: 'news' })) || [];

    // 5. Build final array: fill slots 1-15
    const result = [];
    let autoIndex = 0;

    for (let slot = 1; slot <= MAX_HEADLINES; slot++) {
        if (slotMap.has(slot)) {
            // Use manual headline, ad, or slider ad
            result.push(slotMap.get(slot));
        } else if (autoIndex < autoNews.length) {
            // Use auto-filled news
            result.push(autoNews[autoIndex]);
            autoIndex++;
        } else {
            // No more news available
            break;
        }
    }

    return result;
};

export const fetchSurmanset = async () => {
    // Manşet 2 (Surmanset) - Logic matches fetchHeadlines but for type=2
    const MAX_HEADLINES = 15;

    // 1. Fetch manual headlines (type=2)
    const { data: manualHeadlines } = await supabase
        .from('headlines')
        .select(`
            slot_number,
            news:news_id (
                id, title, image_url, slug, category, created_at, published_at, views
            )
        `)
        .eq('type', 2) // Manşet 2
        //.not('news.published_at', 'is', null)
        .order('slot_number', { ascending: true });

    // 2. Fetch Manşet 2 ads
    const { data: headlineAds } = await supabase
        .from('ads')
        .select('id, name, title, image_url, link_url, placement_code, is_manset_2, manset_2_slot, is_active, views, clicks')
        .eq('is_manset_2', true)
        .not('manset_2_slot', 'is', null)
        .order('manset_2_slot', { ascending: true });

    // 3. Fetch Manşet 2 Slider Ads
    let sliderAds = [];
    try {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .eq('placement_code', 'manset_2_slider')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (!error && data) {
            sliderAds = data;
        }
    } catch (e) { console.warn('Manşet 2 slider ads fetch warning', e); }

    // Create map
    const slotMap = new Map();
    const manualNewsIds = new Set();

    manualHeadlines?.forEach(h => {
        if (h.news) {
            slotMap.set(h.slot_number, { ...h.news, type: 'news' });
            manualNewsIds.add(h.news.id);
        }
    });

    headlineAds?.forEach(ad => {
        slotMap.set(ad.manset_2_slot, {
            ...ad,
            type: 'ad',
            title: ad.title || 'Reklam',
            image_url: ad.image_url,
            id: `ad-${ad.id}`,
            adId: ad.id
        });
    });

    // 4. Get latest news for auto-fill

    // Fetch specifically toggled news first
    const { data: specificNews } = await supabase
        .from('news')
        .select('id, title, image_url, slug, category, created_at, published_at, views')
        .eq('is_manset_2', true)
        //.not('published_at', 'is', null)
        .order('created_at', { ascending: false });

    // Then fetch general latest news (offset by 15 to pick up after Manşet 1)
    const { data: latestNews } = await supabase
        .from('news')
        .select('id, title, image_url, slug, category, created_at, published_at, views')
        //.not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .range(15, 15 + MAX_HEADLINES + manualNewsIds.size);

    // Merge specific and latest
    let autoNews = [];
    if (specificNews) autoNews = [...specificNews];
    if (latestNews) {
        latestNews.forEach(n => {
            if (!autoNews.find(an => an.id === n.id)) autoNews.push(n);
        });
    }

    autoNews = autoNews.filter(n => !manualNewsIds.has(n.id)).map(n => ({ ...n, type: 'news' }));

    // 5. Build Result
    const result = [];
    let autoIndex = 0;

    for (let slot = 1; slot <= MAX_HEADLINES; slot++) {
        if (slotMap.has(slot)) {
            result.push(slotMap.get(slot));
        } else if (autoIndex < autoNews.length) {
            result.push(autoNews[autoIndex]);
            autoIndex++;
        } else {
            break;
        }
    }

    return result;
};

export const fetchNewsByCategory = async (categorySlug) => {
    const { data, error } = await supabase
        .from('news')
        .select(`
            id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views, seo_title, seo_description, seo_keywords,
            news_tags (
                tag_id,
                tags (
                    id,
                    name,
                    slug
                )
            )
        `)
        .eq('category', categorySlug)
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching news by category:', error);
        return [];
    }

    // Flatten tags
    return data.map(item => ({
        ...item,
        tags: item.news_tags?.map(nt => nt.tags).filter(Boolean) || []
    }));
};

export const fetchPopularNews = async (limit = 100) => {
    const { data, error } = await supabase
        .from('news')
        .select(`
            id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views, seo_title, seo_description, seo_keywords,
            news_tags (
                tag_id,
                tags (
                    id,
                    name,
                    slug
                )
            )
        `)
        .not('published_at', 'is', null)
        .order('views', { ascending: false, nullsLast: true })
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching popular news:', error);
        return [];
    }

    // Flatten tags
    return data.map(item => ({
        ...item,
        tags: item.news_tags?.map(nt => nt.tags).filter(Boolean) || []
    }));
};

export const fetchNewsDetail = async (id) => {
    const { data, error } = await supabase
        .from('news')
        .select(`
            *,
            news_tags (
                tag_id,
                tags (
                    id,
                    name,
                    slug
                )
            )
        `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching news detail:', error);
        return null;
    }

    // Transform nested tags structure to flat array
    const flattenedTags = data.news_tags?.map(nt => nt.tags).filter(Boolean) || [];
    return { ...data, tags: flattenedTags };
};

export const fetchNewsByTag = async (tagSlug) => {
    // 1. Get Tag ID and News IDs
    const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select(`
            id,
            name,
            news_tags (
                news (
                    id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views, seo_title, seo_description, seo_keywords
                )
            )
        `)
        .eq('slug', tagSlug)
        .single();

    if (tagError) {
        console.error('Error fetching tag news:', tagError);
        return { name: '', news: [] };
    }

    if (!tagData) return { name: '', news: [] };

    // 2. Flatten structure
    const newsItems = tagData.news_tags
        .map(nt => nt.news)
        .filter(n => n && n.published_at) // Filter nulls and unpublished
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { name: tagData.name, news: newsItems };
};

export const fetchNewsBySlug = async (slug, categorySlug) => {
    return null; // Placeholder as logic is implemented in Component
};

export const fetchNewsByTitleSlug = async (slug, category) => {
    const { data: list, error } = await supabase
        .from('news')
        .select('id, title, category, slug')
        .eq('category', category);

    if (error) return null;

    const match = list.find(item => slugify(item.title) === slug);
    if (!match) return null;

    return await fetchNewsDetail(match.id);
}

export const searchNews = async (query) => {
    const { data, error } = await supabase
        .from('news')
        .select('id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views, seo_title, seo_description, seo_keywords')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching news:', error);
        return [];
    }
    return data;
};

export const searchVideos = async (query) => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .ilike('title', `%${query}%`)
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching videos:', error);
        return [];
    }
    return data;
};

export const searchPhotoGalleries = async (query) => {
    const { data, error } = await supabase
        .from('photo_galleries')
        .select('*, gallery_images(image_url, caption)')
        .ilike('title', `%${query}%`)
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching photo galleries:', error);
        return [];
    }
    return data;
};

export const fetchRelatedNews = async (excludeId) => {
    const { data, error } = await supabase
        .from('news')
        .select(`
            id, title, summary, image_url, video_url, media_type, slug, category, created_at, published_at, views, seo_title, seo_description, seo_keywords,
            news_tags (
                tag_id,
                tags (
                    id,
                    name,
                    slug
                )
            )
        `)
        .not('id', 'eq', excludeId)
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(4);

    if (error) {
        console.error('Error fetching related news:', error);
        return [];
    }

    // Flatten tags
    return data.map(item => ({
        ...item,
        tags: item.news_tags?.map(nt => nt.tags).filter(Boolean) || []
    }));
};

// Financial Data
export const fetchFinancialData = async () => {
    await delay(300);
    return financialData;
};

// Video Gallery
// Video Gallery
export const fetchVideoGalleries = async () => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching video gallery:', error);
        return [];
    }
    return data;
};

export const fetchHomeVideos = async () => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        //.not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(4);

    if (error) {
        console.error('Error fetching home videos:', error);
        return [];
    }
    return data;
};

export const fetchVideoDetail = async (id) => {
    const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching video detail:', error);
        return null;
    }
    return data;
};

// Photo Gallery
export const fetchPhotoGalleries = async () => {
    const { data, error } = await supabase
        .from('photo_galleries')
        .select('*, gallery_images(image_url, caption)')
        .not('published_at', 'is', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching photo gallery:', error);
        return [];
    }
    return data;
};

export const fetchHomePhotoGalleries = async () => {
    const { data, error } = await supabase
        .from('photo_galleries')
        .select('*')
        //.not('published_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(4);

    if (error) {
        console.error('Error fetching home photo galleries:', error);
        return [];
    }
    return data;
};

export const fetchPhotoGalleryDetail = async (id) => {
    const { data, error } = await supabase
        .from('photo_galleries')
        .select('*, gallery_images(image_url, caption)')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching photo gallery detail:', error);
        return null;
    }



    return data;
};

export const fetchGalleryImages = async (galleryId) => {
    const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('order_index', { ascending: true });

    if (error) {
        // Fallback if order_index doesn't exist (though it should)
        if (error.code === '42703') { // Undefined column
            const { data: retryData, error: retryError } = await supabase
                .from('gallery_images')
                .select('*')
                .eq('gallery_id', galleryId)
                .order('created_at', { ascending: true });

            if (retryError) {
                console.error('Error fetching gallery images (retry):', retryError);
                return [];
            }
            return retryData;
        }
        console.error('Error fetching gallery images:', error);
        return [];
    }
    return data;
};

// Subscribers
export const subscribeEmail = async (email) => {
    const { data, error } = await supabase
        .from('subscribers')
        .insert({ email })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error('Bu e-posta adresi zaten kayıtlı.');
        }
        throw error;
    }

    return data;
};

// Ad Placements
export const fetchAdPlacements = async () => {
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching ad placements:', error);
        return [];
    }
    return data;
};

export const fetchAdByPlacementCode = async (placementCode) => {
    const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('placement_code', placementCode)
        .eq('is_active', true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching ad by placement code:', error);
        return null;
    }
    return data;
};

export const incrementNewsViews = async (id) => {
    const { error } = await supabase.rpc('increment_news_views', { news_id: id });

    if (error) {
        console.error('RPC Error, falling back to direct update:', error);
        // Fallback to direct update
        const { data } = await supabase.from('news').select('views').eq('id', id).single();
        if (data) {
            await supabase.from('news').update({ views: (Number(data.views) || 0) + 1 }).eq('id', id);
        }
    }
};

export const incrementVideoView = async (id) => {
    const { data } = await supabase.from('videos').select('views').eq('id', id).single();
    if (data) {
        await supabase.from('videos').update({ views: (Number(data.views) || 0) + 1 }).eq('id', id);
    }
};

export const incrementPhotoGalleryView = async (id) => {
    const { data } = await supabase.from('photo_galleries').select('views').eq('id', id).single();
    if (data) {
        await supabase.from('photo_galleries').update({ views: (Number(data.views) || 0) + 1 }).eq('id', id);
    }
};

// Alias for backward compatibility
export const incrementNewsView = incrementNewsViews;

// Comments
export const fetchComments = async (newsId) => {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('news_id', newsId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
    return data;
};

export const submitComment = async (comment) => {
    const { data, error } = await supabase
        .from('comments')
        .insert([{
            news_id: comment.newsId,
            user_name: comment.name,
            comment: comment.content,
            is_approved: false, // Comments need approval by default
            created_at: new Date().toISOString()
        }])
        .select()
        .single();

    if (error) {
        console.error('Error submitting comment:', error);
        throw error;
    }
    return data;
};

// Aliases for backward compatibility
export const fetchPhotoGallery = fetchPhotoGalleries;
export const fetchVideoGallery = fetchVideoGalleries;
export const fetchVideos = fetchVideoGalleries;
