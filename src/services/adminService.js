import { supabase } from './supabase';
import { slugify } from '../utils/slugify';

export const adminService = {
    async getDashboardStats() {
        // 1. Active News Count
        const { count: activeNewsCount, error: newsError } = await supabase
            .from('news')
            .select('*', { count: 'exact', head: true })
            .not('published_at', 'is', null);

        if (newsError) console.error('Error fetching news count:', newsError);

        // 2. Subscribers Count
        const { count: subscribersCount, error: subsError } = await supabase
            .from('subscribers')
            .select('*', { count: 'exact', head: true });

        if (subsError) console.error('Error fetching subscribers count:', subsError);

        // 3. Total Comments Count (Replacing Revenue)
        const { count: commentsCount, error: commentsError } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true });

        if (commentsError) console.error('Error fetching comments count:', commentsError);

        // 4. Total Views (Sum of news views - Simplified approximation)
        // Note: For large datasets, use RPC. For now, fetching views column.
        const { data: viewsData, error: viewsError } = await supabase
            .from('news')
            .select('views');

        let totalViews = 0;
        if (!viewsError && viewsData) {
            totalViews = viewsData.reduce((sum, item) => sum + (item.views || 0), 0);
        }

        return {
            activeNews: activeNewsCount || 0,
            subscribers: subscribersCount || 0,
            totalComments: commentsCount || 0,
            totalViews: totalViews
        };
    },

    // Service: Settings
    async getSettings() {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) throw error;

        // Transform array to object for easier consumption
        const settingsObject = {};
        data.forEach(item => {
            settingsObject[item.key] = item.value;
        });

        return settingsObject;
    },

    async updateSetting(key, value) {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert({ key, value })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateSettingsBulk(settingsArray) {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert(settingsArray)
            .select();

        if (error) throw error;
        return data;
    },

    // Service: Ads
    async getAdPlacements() {
        const { data, error } = await supabase
            .from('ad_placements')
            .select('*')
            .order('id');

        if (error) throw error;
        return data;
    },

    async updateAdPlacement(id, updates) {
        const { data, error } = await supabase
            .from('ad_placements')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Service: Comments
    async getComments() {
        const { data, error } = await supabase
            .from('comments')
            .select('*, news:news_id(title)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async approveComment(id) {
        const { data, error } = await supabase
            .from('comments')
            .update({ is_approved: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteComment(id) {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Service: Tags
    async getTags() {
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    async addTag(name) {
        // Basic slug generation
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

        const { data, error } = await supabase
            .from('tags')
            .insert({ name, slug })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTag(id) {
        const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Service: Redirects
    async getRedirects() {
        const { data, error } = await supabase
            .from('redirects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async addRedirect(redirect) {
        const { data, error } = await supabase
            .from('redirects')
            .insert(redirect)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteRedirect(id) {
        const { error } = await supabase
            .from('redirects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Service: News (with Duplicate Check)
    async checkDuplicateNews(title, excludeId = null) {
        // Simple similar title check
        let query = supabase
            .from('news')
            .select('id, title, slug')
            .ilike('title', title)
            .limit(1);

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.length > 0 ? data[0] : null;
    },

    async getNewsList(page = 0, pageSize = 20) {
        const { data, error, count } = await supabase
            .from('news')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        return { data, count };
    },

    async deleteNews(id) {
        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Service: Subscribers
    async getSubscribers() {
        const { data, error } = await supabase
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false });


        return settingsObject;
    },

    async updateSetting(key, value) {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert({ key, value })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateSettingsBulk(settingsArray) {
        const { data, error } = await supabase
            .from('site_settings')
            .upsert(settingsArray)
            .select();

        if (error) throw error;
        return data;
    },

    // Service: Ads
    async getAdPlacements() {
        const { data, error } = await supabase
            .from('ad_placements')
            .select('*')
            .order('id');

        if (error) throw error;
        return data;
    },

    async createAdPlacement(ad) {
        const { data, error } = await supabase
            .from('ad_placements')
            .insert(ad)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateAdPlacement(id, updates) {
        const { data, error } = await supabase
            .from('ad_placements')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async incrementAdView(id) {
        // Optimistic update or minimal query?
        // Ideally: rpc('increment_ad_view', { row_id: id })
        // Fallback: fetch count, increment, update.
        // For reliability without RPC:
        const { data } = await supabase.from('ad_placements').select('views').eq('id', id).single();
        if (data) {
            await supabase.from('ad_placements').update({ views: (data.views || 0) + 1 }).eq('id', id);
        }
    },

    async incrementAdClick(id) {
        const { data } = await supabase.from('ad_placements').select('clicks').eq('id', id).single();
        if (data) {
            await supabase.from('ad_placements').update({ clicks: (data.clicks || 0) + 1 }).eq('id', id);
        }
    },

    // Service: Comments
    async getComments() {
        const { data, error } = await supabase
            .from('comments')
            .select('*, news:news_id(title)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async approveComment(id) {
        const { data, error } = await supabase
            .from('comments')
            .update({ is_approved: true })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteComment(id) {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Service: Tags
    async getTags() {
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    },

    async addTag(name) {
        // Basic slug generation
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

        const { data, error } = await supabase
            .from('tags')
            .insert({ name, slug })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTag(id) {
        const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Service: Redirects
    async getRedirects() {
        const { data, error } = await supabase
            .from('redirects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async addRedirect(redirect) {
        const { data, error } = await supabase
            .from('redirects')
            .insert(redirect)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteRedirect(id) {
        const { error } = await supabase
            .from('redirects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Service: News (with Duplicate Check)
    async checkDuplicateNews(title, excludeId = null) {
        // Simple similar title check
        let query = supabase
            .from('news')
            .select('id, title, slug')
            .ilike('title', title)
            .limit(1);

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.length > 0 ? data[0] : null;
    },

    async getNewsList(page = 0, pageSize = 20, filters = {}) {
        let query = supabase
            .from('news')
            .select('*', { count: 'exact' });

        // Apply filters
        if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }
        if (filters.status === 'published') {
            query = query.not('published_at', 'is', null);
        } else if (filters.status === 'draft') {
            query = query.is('published_at', null);
        }
        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        return { data, count };
    },

    async deleteNews(id) {
        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async deleteNewsBulk(ids) {
        const { error } = await supabase
            .from('news')
            .delete()
            .in('id', ids);

        if (error) throw error;
        return true;
    },

    async duplicateNewsBulk(ids) {
        // Parallel execution
        const promises = ids.map(id => this.duplicateNews(id));
        await Promise.all(promises);
        return true;
    },

    async updateNews(id, updates) {
        const { data, error } = await supabase
            .from('news')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async duplicateNews(id) {
        // 1. Fetch original
        const { data: original, error: fetchError } = await supabase
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 2. Prepare copy payload
        // Omit id, created_at, updated_at to let DB handle them
        const { id: _, created_at, updated_at, ...copyData } = original;

        copyData.title = `${copyData.title} (Kopya)`;

        // Ensure base slug exists
        const baseSlug = copyData.slug || slugify(copyData.title);
        // Use random number for safe uniqueness without long timestamps
        copyData.slug = `${baseSlug}-kopya-${Math.floor(Math.random() * 100000)}`;

        // Remove published_at to let DB use default (Active) logic
        delete copyData.published_at;
        copyData.views = 0;
        copyData.is_slider = false;

        // 3. Insert copy
        const { data, error } = await supabase
            .from('news')
            .insert(copyData)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Service: Subscribers
    async getSubscribers() {
        const { data, error } = await supabase
            .from('subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async deleteSubscriber(id) {
        const { error } = await supabase
            .from('subscribers')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Service: Photo Galleries
    async getPhotoGalleries(page = 0, pageSize = 20, filters = {}) {
        let query = supabase
            .from('photo_galleries')
            .select('*, gallery_images(image_url)', { count: 'exact' });

        // Apply search filter
        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        if (filters.status === 'published') {
            query = query.not('published_at', 'is', null);
        } else if (filters.status === 'draft') {
            query = query.is('published_at', null);
        }

        // Order and paginate
        query = query
            .order('created_at', { ascending: false })
            .range(page * pageSize, (page + 1) * pageSize - 1);

        const { data, error, count } = await query;

        if (error) throw error;
        return { data, count };
    },

    async getPhotoGallery(id) {
        const { data, error } = await supabase
            .from('photo_galleries')
            .select('*, gallery_images(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        // Sort images by order_index
        if (data && data.gallery_images) {
            data.gallery_images.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
        }
        return data;
    },

    async createPhotoGallery(gallery, images) {
        // 1. Create Gallery
        const { data: galleryData, error: galleryError } = await supabase
            .from('photo_galleries')
            .insert(gallery)
            .select()
            .single();

        if (galleryError) throw galleryError;

        // 2. Add Images if any
        if (images && images.length > 0) {
            const imagesPayload = images.map((img, index) => ({
                gallery_id: galleryData.id,
                image_url: img.image_url,
                caption: img.caption || '',
                order_index: index
            }));

            const { error: imagesError } = await supabase
                .from('gallery_images')
                .insert(imagesPayload);

            if (imagesError) throw imagesError;
        }

        return galleryData;
    },

    async updatePhotoGallery(id, gallery, images) {
        // 1. Update Gallery Details
        const { error: galleryError } = await supabase
            .from('photo_galleries')
            .update(gallery)
            .eq('id', id);

        if (galleryError) throw galleryError;

        // 2. Sync Images (Delete all and re-insert is easiest for this scale, 
        // but better to verify existing. For simplicity in this iteration: Delete All -> Insert All)
        // Warning: unique IDs on images might change. If that's an issue, we need smart diffing.
        // Given the request "detaylandır", let's be safe and just delete/re-insert for now as it guarantees order.

        // Delete old images
        const { error: deleteError } = await supabase
            .from('gallery_images')
            .delete()
            .eq('gallery_id', id);

        if (deleteError) throw deleteError;

        // Insert new images
        if (images && images.length > 0) {
            const imagesPayload = images.map((img, index) => ({
                gallery_id: id,
                image_url: img.image_url,
                caption: img.caption || '',
                order_index: index
            }));

            const { error: insertError } = await supabase
                .from('gallery_images')
                .insert(imagesPayload);

            if (insertError) throw insertError;
        }

        return true;
    },

    async deletePhotoGallery(id) {
        // Cascade delete handles images usually, but safe to trust DB cascade
        const { error } = await supabase
            .from('photo_galleries')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async duplicatePhotoGallery(id) {
        // 1. Fetch original gallery with images
        const { data: original, error: fetchError } = await supabase
            .from('photo_galleries')
            .select('*, gallery_images(*)')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // 2. Prepare gallery copy
        const { id: _, created_at, published_at, gallery_images, ...galleryData } = original;
        galleryData.title = `${galleryData.title} (Kopya)`;
        galleryData.views = 0;

        // 3. Insert gallery copy
        const { data: newGallery, error: galleryError } = await supabase
            .from('photo_galleries')
            .insert(galleryData)
            .select()
            .single();

        if (galleryError) throw galleryError;

        // 4. Copy images if any
        if (gallery_images && gallery_images.length > 0) {
            const imagesCopy = gallery_images.map(img => ({
                gallery_id: newGallery.id,
                image_url: img.image_url,
                caption: img.caption,
                order_index: img.order_index
            }));

            const { error: imagesError } = await supabase
                .from('gallery_images')
                .insert(imagesCopy);

            if (imagesError) throw imagesError;
        }

        return newGallery;
    },

    async duplicatePhotoGalleriesBulk(ids) {
        const promises = ids.map(id => this.duplicatePhotoGallery(id));
        await Promise.all(promises);
        return true;
    },

    async deletePhotoGalleriesBulk(ids) {
        const { error } = await supabase
            .from('photo_galleries')
            .delete()
            .in('id', ids);

        if (error) throw error;
        return true;
    },

    async togglePhotoGalleryStatus(id, isPublished) {
        console.log('Service toggle called:', id, isPublished);
        const { data, error } = await supabase
            .from('photo_galleries')
            .update({ published_at: isPublished ? new Date().toISOString() : null })
            .eq('id', id)
            .select();

        console.log('Supabase update result:', data, error);

        if (error) throw error;
        return true;
    },


    // Service: Videos
    async getVideos(page = 0, pageSize = 20, filters = {}) {
        let query = supabase
            .from('videos')
            .select('*', { count: 'exact' });

        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        if (filters.status === 'published') {
            query = query.not('published_at', 'is', null);
        } else if (filters.status === 'draft') {
            query = query.is('published_at', null);
        }

        // Add sorting
        query = query.order('created_at', { ascending: false });

        // Add pagination
        const from = page * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) throw error;
        return { data, count };
    },

    async getVideo(id) {
        const { data, error } = await supabase
            .from('videos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createVideo(video) {
        const { data, error } = await supabase
            .from('videos')
            .insert([{ ...video, published_at: new Date() }]) // Default published
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateVideo(id, video) {
        const { data, error } = await supabase
            .from('videos')
            .update(video)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteVideo(id) {
        const { error } = await supabase
            .from('videos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async toggleVideoStatus(id, status) {
        const { error } = await supabase
            .from('videos')
            .update({ published_at: status ? new Date().toISOString() : null })
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async duplicateVideosBulk(ids) {
        // Fetch originals
        const { data: originals, error: fetchError } = await supabase
            .from('videos')
            .select('*')
            .in('id', ids);

        if (fetchError) throw fetchError;
        if (!originals || originals.length === 0) return;

        // Prepare copies
        const copies = originals.map(video => ({
            title: `${video.title} (Kopya)`,
            video_url: video.video_url,
            thumbnail_url: video.thumbnail_url,
            duration: video.duration,
            description: video.description,
            views: 0,
            published_at: null // Copies are drafts
        }));

        const { error: insertError } = await supabase
            .from('videos')
            .insert(copies);

        if (insertError) throw insertError;
        return true;
    },

    async deleteVideosBulk(ids) {
        const { error } = await supabase
            .from('videos')
            .delete()
            .in('id', ids);

        if (error) throw error;
        return true;
    },

    // Service: User Profiles
    async getProfiles() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            // Return null if not found (might not exist yet)
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    async updateUserProfile(id, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({ id, ...updates }) // Upsert handles create if not exists
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Service: Storage
    async uploadImage(file, bucket = 'images') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // Service: Gallery Thumbnail Upload
    async uploadGalleryThumbnail(file) {
        // Validate file size (max 1MB)
        const maxSize = 1 * 1024 * 1024; // 1MB in bytes
        if (file.size > maxSize) {
            throw new Error('Dosya boyutu 1MB\'dan büyük olamaz.');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Sadece JPEG, PNG ve WebP formatları desteklenmektedir.');
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `thumbnail_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('gallery-thumbnails')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Dosya yüklenirken hata oluştu: ' + uploadError.message);
        }

        // Get public URL
        const { data } = supabase.storage
            .from('gallery-thumbnails')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    async deleteGalleryThumbnail(url) {
        if (!url) return;

        try {
            // Extract filename from URL
            // URL format: https://.../storage/v1/object/public/gallery-thumbnails/filename.jpg
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1];

            if (!filename) return;

            // Delete from Supabase Storage
            const { error } = await supabase.storage
                .from('gallery-thumbnails')
                .remove([filename]);

            if (error) {
                console.error('Delete error:', error);
            }
        } catch (error) {
            console.error('Error deleting thumbnail:', error);
            // Don't throw - deletion is not critical
        }
    },

    // Service: Gallery Images Upload (Multiple)
    async uploadGalleryImages(files, onProgress) {
        const uploadedUrls = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                throw new Error(`${file.name}: Dosya boyutu 5MB'dan büyük olamaz.`);
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error(`${file.name}: Sadece JPEG, PNG ve WebP formatları desteklenmektedir.`);
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `gallery_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('gallery-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw new Error(`${file.name}: Dosya yüklenirken hata oluştu - ${uploadError.message}`);
            }

            // Get public URL
            const { data } = supabase.storage
                .from('gallery-images')
                .getPublicUrl(filePath);

            uploadedUrls.push(data.publicUrl);

            // Update progress
            if (onProgress) {
                const progress = Math.round(((i + 1) / totalFiles) * 100);
                onProgress(progress);
            }
        }

        return uploadedUrls;
    },

    async deleteGalleryImage(url) {
        if (!url) return;

        try {
            // Extract filename from URL
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1];

            if (!filename) return;

            // Delete from Supabase Storage
            const { error } = await supabase.storage
                .from('gallery-images')
                .remove([filename]);

            if (error) {
                console.error('Delete error:', error);
            }
        } catch (error) {
            console.error('Error deleting gallery image:', error);
            // Don't throw - deletion is not critical
        }
    },

    // Service: Video Upload
    async uploadVideo(file, onProgress) {
        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            throw new Error(`Dosya boyutu 50MB'dan büyük olamaz.`);
        }

        // Validate file type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Desteklenmeyen video formatı. Sadece MP4, WebM, OGG ve MOV yüklenebilir.`);
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `video_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('videos') // Requires 'videos' bucket to be created
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Video yüklenirken hata oluştu: ${uploadError.message}`);
        }

        // Get public URL
        const { data } = supabase.storage
            .from('videos')
            .getPublicUrl(filePath);

        // Mock progress (since fetch API doesn't support progress easily without XHR)
        // If supabase-js supports it in newer versions, it's automatic. 
        // For now we just call 100% when done.
        if (onProgress) onProgress(100);

        return data.publicUrl;
    },

    // Increment gallery views
    async incrementGalleryViews(galleryId) {
        const { data } = await supabase
            .from('photo_galleries')
            .select('views')
            .eq('id', galleryId)
            .single();

        if (data) {
            await supabase
                .from('photo_galleries')
                .update({ views: parseInt(data.views || 0) + 1 })
                .eq('id', galleryId);
        }
    },

    // Increment video views
    async incrementVideoViews(videoId) {
        const { data } = await supabase
            .from('videos')
            .select('views')
            .eq('id', videoId)
            .single();

        if (data) {
            await supabase
                .from('videos')
                .update({ views: parseInt(data.views || 0) + 1 })
                .eq('id', videoId);
        }
    }
};
