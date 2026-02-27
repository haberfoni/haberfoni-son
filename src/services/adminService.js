import { slugify } from '../utils/slugify.js';
import apiClient from './apiClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://142.132.229.92:3000';

export const adminService = {
    // ... (rest of the file)
    // Service: Pages
    async getPages() {
        try {
            const res = await apiClient.get('/pages');
            return res.data || [];
        } catch (e) { console.error('getPages error:', e); return []; }
    },

    // Service: Footer Sections (stubbed - not in NestJS API yet, return empty)
    async getFooterSections() { return []; },
    async createFooterSection(d) { return d; },
    async updateFooterSection(id, d) { return d; },
    async deleteFooterSection(id) { return true; },
    async reorderFooterSections(s) { return true; },

    // Service: Footer Links (stubbed)
    async getFooterLinks(sectionId = null) { return []; },
    async createFooterLink(d) { return d; },
    async updateFooterLink(id, d) { return d; },
    async deleteFooterLink(id) { return true; },
    async reorderFooterLinks(l) { return true; },

    async getPage(id) {
        const res = await apiClient.get(`/pages/${id}`);
        return res.data;
    },

    async getPageBySlug(slug) {
        const res = await apiClient.get(`/pages?slug=${slug}&is_active=true`).catch(() => ({ data: null }));
        return Array.isArray(res.data) ? res.data[0] || null : res.data;
    },

    async createPage(pageData) {
        const res = await apiClient.post('/pages', { ...pageData, slug: slugify(pageData.slug || pageData.title) });
        await this.logActivity('CREATE', 'PAGE', `Yeni sayfa oluşturuldu: ${pageData.title}`, res.data.id);
        return res.data;
    },

    async updatePage(id, pageData) {
        const updateData = { ...pageData };
        if (updateData.title && !updateData.slug) {
            // Only update slug if explicit or if title changed and slug wasn't provided (optional logic, kept simple here)
        }

        try {
            const response = await apiClient.patch(`/pages/${id}`, updateData);
            await this.logActivity('UPDATE', 'PAGE', `Sayfa güncellendi: ${pageData.title || id}`, id);
            return response.data;
        } catch (error) {
            console.error('Error updating page:', error);
            throw error;
        }
    },

    async deletePage(id) {
        try {
            await apiClient.delete(`/pages/${id}`);
            await this.logActivity('DELETE', 'PAGE', `Sayfa silindi: ${id}`, id);
        } catch (error) {
            console.error('Error deleting page:', error);
            throw error;
        }
    },

    async getDashboardStats() {
        try {
            const response = await apiClient.get('/stats/dashboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return {
                activeNews: 0,
                subscribers: 0,
                totalComments: 0,
                totalViews: 0
            };
        }
    },

    // Service: Settings
    async getSettings() {
        try {
            const res = await apiClient.get('/settings');
            const obj = {};
            (res.data || []).forEach(item => { obj[item.key] = item.value; });
            return obj;
        } catch (e) { return {}; }
    },

    async updateSetting(key, value) {
        const res = await apiClient.patch(`/settings/${key}`, { value });
        await this.logActivity('UPDATE', 'SETTINGS', `Ayar güncellendi: ${key}`, 1);
        return res.data;
    },

    async updateSettingsBulk(settingsArray) {
        for (const s of settingsArray) {
            await apiClient.patch(`/settings/${s.key}`, { value: s.value }).catch(() => { });
        }
        await this.logActivity('UPDATE', 'SETTINGS', `Ayarlar toplu güncellendi`, 1);
        return true;
    },



    // Service: Home Layout


    async getHomeLayout() {
        try {
            const response = await apiClient.get('/settings/home_layout');
            const data = response.data;

            if (data && data.value) {
                try {
                    const parsedLayout = JSON.parse(data.value);
                    // Fix: Ensure home_top is enabled if it exists, as it's a critical section
                    if (parsedLayout.sections) {
                        let topSection = parsedLayout.sections.find(s => s.id === 'home_top');

                        if (!topSection) {
                            // If missing, inject it at the start
                            topSection = { id: 'home_top', name: 'Üst Sponsor', type: 'ad', enabled: true, removable: false };
                            parsedLayout.sections.unshift(topSection);
                        } else {
                            // If exists, ensure enabled
                            topSection.enabled = true;
                        }
                    }
                    return parsedLayout;
                } catch (e) {
                    console.error('Error parsing home layout:', e);
                }
            }
        } catch (error) {
            // If 404, it returns default
            if (error.response && error.response.status !== 404) {
                console.error('Error fetching home layout:', error);
            }
        }

        // Default layout
        return {
            sections: [
                { id: 'home_top', name: 'Üst Reklam', type: 'ad', enabled: true, removable: false },
                { id: 'headline_slider', name: 'Manşet 1 (Ana Manşet)', type: 'content', enabled: true, removable: false },
                { id: 'home_between_mansets', name: 'Manşetler Arası Reklam', type: 'ad', enabled: true, removable: true },
                { id: 'surmanset', name: 'Manşet 2 (Sürmanşet)', type: 'content', enabled: true, removable: true },
                { id: 'home_list_top', name: 'Ana Sayfa Liste Üstü', type: 'ad', enabled: true, removable: true },
                { id: 'breaking_news', name: 'Son Dakika', type: 'content', enabled: true, removable: false },
                { id: 'multimedia', name: 'Multimedya (Video & Foto)', type: 'content', enabled: true, removable: true },
                { id: 'categories', name: 'Kategori Bölümleri (Dinamik)', type: 'content', enabled: true, removable: true }
            ]
        };
    },

    async saveHomeLayout(layout) {
        try {
            const response = await apiClient.patch('/settings/home_layout', {
                value: JSON.stringify(layout)
            });
            await this.logActivity('UPDATE', 'HOME_LAYOUT', 'Ana sayfa düzeni ve kategori ayarları güncellendi', null);
            return response.data;
        } catch (error) {
            console.error('Error saving home layout:', error);
            throw error;
        }
    },


    // Service: Ads


    // Service: Ads
    // Service: Ads
    async getAdPlacements() {
        try {
            const response = await apiClient.get('/ads');
            return response.data;
        } catch (error) {
            console.error('Error fetching ads:', error);
            throw error;
        }
    },

    async createAdPlacement(ad) {
        try {
            const response = await apiClient.post('/ads', ad);
            await this.logActivity('CREATE', 'ADS', `Yeni reklam alanı oluşturuldu: ${ad.name}`, response.data.id);
            return response.data;
        } catch (error) {
            console.error('Error creating ad:', error);
            throw error;
        }
    },

    async updateAdPlacement(id, updates) {
        try {
            const response = await apiClient.patch(`/ads/${id}`, updates);

            // Simplified logging
            let desc = `Reklam güncellendi: ${updates.name || id}`;
            if (updates.image_url !== undefined) {
                desc += ' (Görsel güncellendi)';
            }
            await this.logActivity('UPDATE', 'ADS', desc, id);

            return response.data;
        } catch (error) {
            console.error(`Error updating ad ${id}:`, error);
            throw error;
        }
    },

    async deleteAdPlacement(id) {
        try {
            await apiClient.delete(`/ads/${id}`);
            await this.logActivity('DELETE', 'ADS', `Reklam silindi`, id);
        } catch (error) {
            console.error(`Error deleting ad ${id}:`, error);
            throw error;
        }
    },

    async incrementAdView(id) {
        try {
            // Fetch current to increment
            // TODO: Implement atomic increment in backend
            const { data } = await apiClient.get(`/ads/${id}`);
            if (data) {
                await apiClient.patch(`/ads/${id}`, { views: (data.views || 0) + 1 });
            }
        } catch (e) {
            // Fail silently for analytics
            console.error('Error incrementing ad view:', e);
        }
    },

    async incrementAdClick(id) {
        try {
            const { data } = await apiClient.get(`/ads/${id}`);
            if (data) {
                await apiClient.patch(`/ads/${id}`, { clicks: (data.clicks || 0) + 1 });
            }
        } catch (e) {
            console.error('Error incrementing ad click:', e);
        }
    },

    // Service: Comments
    async getComments() {
        try {
            const res = await apiClient.get('/comments');
            return res.data || [];
        } catch (e) { return []; }
    },

    async approveComment(id) {
        const res = await apiClient.patch(`/comments/${id}`, { is_approved: true });
        await this.logActivity('UPDATE', 'COMMENT', `Yorum onaylandı: ${id}`, id);
        return res.data;
    },

    async deleteComment(id) {
        try {
            await apiClient.delete(`/comments/${id}`);
        } catch (err) {
            console.error('Error deleting comment:', err);
            throw err;
        }
        await this.logActivity('DELETE', 'COMMENT', `Yorum silindi: ${id}`, id);
        return true;
    },

    // Service: Tags
    async getTags() {
        try { const res = await apiClient.get('/tags'); return res.data || []; } catch (e) { return []; }
    },

    async addTag(name) {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
        const res = await apiClient.post('/tags', { name, slug });
        await this.logActivity('CREATE', 'TAG', `Yeni etiket eklendi: ${name}`, res.data.id);
        return res.data;
    },

    async deleteTag(id) {
        await apiClient.delete(`/tags/${id}`);
        await this.logActivity('DELETE', 'TAG', `Etiket silindi: ${id}`, id);
        return true;
    },

    // Service: Redirects
    async getRedirects() {
        try { const res = await apiClient.get('/redirects'); return res.data || []; } catch (e) { return []; }
    },

    async addRedirect(redirect) {
        const res = await apiClient.post('/redirects', redirect);
        await this.logActivity('CREATE', 'REDIRECT', `Yönlendirme eklendi`, res.data.id);
        return res.data;
    },

    async deleteRedirect(id) {
        await apiClient.delete(`/redirects/${id}`);
        await this.logActivity('DELETE', 'REDIRECT', `Yönlendirme silindi: ${id}`, id);
        return true;
    },

    // Service: News
    async checkDuplicateNews(title, excludeId = null) {
        try {
            const res = await apiClient.get('/news', { params: { search: title, limit: 1 } });
            const items = res.data?.data || [];
            return items.length > 0 && items[0].id !== excludeId ? items[0] : null;
        } catch (e) { return null; }
    },

    async getNewsBySlug(slug) {
        try {
            const res = await apiClient.get(`/news?slug=${slug}`);
            const items = res.data?.data || res.data || [];
            return Array.isArray(items) ? items[0] || null : items;
        } catch (e) { return null; }
    },

    async getNewsList(page = 0, pageSize = 20, filters = {}) {
        try {
            const params = {
                page: page + 1, // API is 1-indexed
                limit: pageSize,
                category: filters.category !== 'all' ? filters.category : undefined,
                search: filters.search,
                status: filters.status,
                authorId: filters.authorId
            };
            const response = await apiClient.get('/news', { params });
            return {
                data: response.data.data,
                count: response.data.meta.total
            };
        } catch (error) {
            console.error('Error fetching news list:', error);
            return { data: [], count: 0 };
        }
    },

    async deleteNews(id) {
        try {
            await apiClient.delete(`/news/${id}`);
            await this.logActivity('DELETE', 'NEWS', `Haber silindi: ${id}`, id);
            return true;
        } catch (error) {
            console.error('Error deleting news:', error);
            throw error;
        }
    },

    async deleteNewsBulk(ids) {
        if (!ids || ids.length === 0) return;
        try {
            await apiClient.post('/news/bulk-delete', { ids });
            return true;
        } catch (error) {
            console.error('Error deleting news bulk:', error);
            throw error;
        }
    },

    async duplicateNewsBulk(ids) {
        // Parallel execution
        const promises = ids.map(id => this.duplicateNews(id));
        await Promise.all(promises);
        return true;
    },

    async getNews(id) {
        try {
            const response = await apiClient.get(`/news/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching news ${id}:`, error);
            throw error;
        }
    },

    async createNews(news) {
        try {
            const response = await apiClient.post('/news', news);
            return response.data;
        } catch (error) {
            console.error('Error creating news:', error);
            throw error;
        }
    },

    async updateNews(id, updates) {
        try {
            const response = await apiClient.patch(`/news/${id}`, updates);
            return response.data;
        } catch (error) {
            console.error(`Error updating news ${id}:`, error);
            throw error;
        }
    },

    async duplicateNews(id) {
        try {
            const res = await apiClient.get(`/news/${id}`);
            const original = res.data;
            if (!original) throw new Error('Haber bulunamadı');
            const { id: _, created_at, updated_at, ...newsData } = original;
            const newTitle = `${newsData.title} (Kopya)`;
            const baseSlug = newsData.slug || slugify(newsData.title);
            const created = await apiClient.post('/news', {
                ...newsData, title: newTitle,
                slug: `${baseSlug}-kopya-${Math.floor(Math.random() * 100000)}`,
                published_at: null, views: 0, is_slider: false
            });
            return created.data;
        } catch (error) { console.error('Error duplicating news:', error); throw error; }
    },

    // Service: Subscribers
    async getSubscribers() {
        try { const res = await apiClient.get('/subscribers'); return res.data || []; } catch (e) { return []; }
    },

    async deleteSubscriber(id) {
        await apiClient.delete(`/subscribers/${id}`);
        await this.logActivity('DELETE', 'SUBSCRIBER', `Abone silindi: ${id}`, id);
        return true;
    },

    // Service: Photo Galleries
    async getPhotoGalleries(page = 0, pageSize = 20, filters = {}) {
        try {
            const params = { page: page + 1, limit: pageSize, search: filters.search, status: filters.status };
            const res = await apiClient.get('/galleries', { params });
            return { data: res.data?.data || res.data || [], count: res.data?.meta?.total || 0 };
        } catch (e) { return { data: [], count: 0 }; }
    },

    async getPhotoGallery(id) {
        const res = await apiClient.get(`/galleries/${id}`);
        return res.data;
    },

    async createPhotoGallery(gallery, images) {
        const res = await apiClient.post('/galleries', gallery);
        const galleryData = res.data;
        if (images && images.length > 0) {
            const imagesPayload = images.map((img, i) => ({ gallery_id: galleryData.id, image_url: img.image_url, caption: img.caption || '', order_index: i }));
            await apiClient.post(`/galleries/${galleryData.id}/images`, { images: imagesPayload });
        }
        await this.logActivity('CREATE', 'PHOTO_GALLERY', `Yeni galeri oluşturuldu: ${gallery.title}`, galleryData.id);
        return galleryData;
    },

    async updatePhotoGallery(id, gallery, images) {
        // 1. Update Gallery Details

        try {
            await apiClient.patch(`/galleries/${id}`, gallery);
        } catch (e) {
            console.error('Error updating gallery:', e);
            throw e;
        }

        // 2. Sync Images
        try {
            // Delete old images and re-insert
            await apiClient.delete(`/galleries/${id}/images`);
            if (images && images.length > 0) {
                const imagesPayload = images.map((img, index) => ({
                    gallery_id: id,
                    image_url: img.image_url,
                    caption: img.caption || '',
                    order_index: index
                }));
                await apiClient.post(`/galleries/${id}/images`, { images: imagesPayload });
            }
        } catch (e) {
            console.error('Error syncing gallery images:', e);
        }

        await this.logActivity('UPDATE', 'PHOTO_GALLERY', `Galeri güncellendi: ${gallery.title || id}`, id);
        return true;
    },

    async deletePhotoGallery(id) {
        try {
            await apiClient.delete(`/galleries/${id}`);
            await this.logActivity('DELETE', 'PHOTO_GALLERY', `Galeri silindi: ${id}`, id);
            return true;
        } catch (error) {
            console.error('Error deleting gallery:', error);
            throw error;
        }
    },

    async duplicatePhotoGallery(id) {
        const res = await apiClient.get(`/galleries/${id}`);
        const original = res.data;
        if (!original) throw new Error('Galeri bulunamadı');
        const { id: _, created_at, published_at, gallery_images, ...galleryData } = original;
        galleryData.title = `${galleryData.title} (Kopya)`;
        galleryData.views = 0;
        const newGallery = await apiClient.post('/galleries', galleryData);
        if (gallery_images && gallery_images.length > 0) {
            const imagesCopy = gallery_images.map(img => ({ gallery_id: newGallery.data.id, image_url: img.image_url, caption: img.caption, order_index: img.order_index }));
            await apiClient.post(`/galleries/${newGallery.data.id}/images`, { images: imagesCopy });
        }
        await this.logActivity('CREATE', 'PHOTO_GALLERY', `Galeri kopyalandı: ${galleryData.title}`, newGallery.data.id);
        return newGallery.data;
    },

    async duplicatePhotoGalleriesBulk(ids) {
        const promises = ids.map(id => this.duplicatePhotoGallery(id));
        await Promise.all(promises);
        return true;
    },

    async deletePhotoGalleriesBulk(ids) {
        await apiClient.post('/galleries/bulk-delete', { ids });
        await this.logActivity('DELETE', 'PHOTO_GALLERY', `Galeriler toplu silindi: ${ids.length} adet`);
        return true;
    },

    async togglePhotoGalleryStatus(id, isPublished) {
        await apiClient.patch(`/galleries/${id}`, { published_at: isPublished ? new Date().toISOString() : null });
        await this.logActivity('UPDATE', 'PHOTO_GALLERY', `Galeri durumu değiştirildi: ${isPublished ? 'Yayında' : 'Taslak'}`, id);
        return true;
    },


    // Service: Videos
    async getVideos(page = 0, pageSize = 20, filters = {}) {
        try {
            const params = { page: page + 1, limit: pageSize, search: filters.search, status: filters.status };
            const res = await apiClient.get('/videos', { params });
            return { data: res.data?.data || res.data || [], count: res.data?.meta?.total || 0 };
        } catch (e) { return { data: [], count: 0 }; }
    },

    async getVideo(id) {
        const res = await apiClient.get(`/videos/${id}`);
        return res.data;
    },

    async createVideo(video) {
        const res = await apiClient.post('/videos', { ...video, published_at: new Date() });
        await this.logActivity('CREATE', 'VIDEO', `Yeni video eklendi: ${video.title}`, res.data.id);
        return res.data;
    },

    async updateVideo(id, video) {
        try {
            const response = await apiClient.patch(`/videos/${id}`, video);
            await this.logActivity('UPDATE', 'VIDEO', `Video güncellendi (ID: ${id})`, id);
            return response.data;
        } catch (error) {
            console.error('Error updating video:', error);
            throw error;
        }
    },

    async deleteVideo(id) {
        try {
            await apiClient.delete(`/videos/${id}`);
            await this.logActivity('DELETE', 'VIDEO', `Video silindi: ${id}`, id);
            return true;
        } catch (error) {
            console.error('Error deleting video:', error);
            throw error;
        }
    },

    async toggleVideoStatus(id, status) {
        try {
            await apiClient.patch(`/videos/${id}`, { published_at: status ? new Date().toISOString() : null });
            await this.logActivity('UPDATE', 'VIDEO', `Video durumu değiştirildi: ${status ? 'Yayında' : 'Taslak'}`, id);
            return true;
        } catch (error) {
            console.error('Error toggling video status:', error);
            throw error;
        }
    },

    async duplicateVideosBulk(ids) {
        for (const id of ids) {
            try {
                const res = await apiClient.get(`/videos/${id}`);
                const v = res.data;
                if (!v) continue;
                await apiClient.post('/videos', { title: `${v.title} (Kopya)`, video_url: v.video_url, thumbnail_url: v.thumbnail_url, duration: v.duration, description: v.description, views: 0, published_at: null });
            } catch (e) { console.error('Error duplicating video:', e); }
        }
        await this.logActivity('CREATE', 'VIDEO', `Videolar toplu kopyalandı: ${ids.length} adet`);
        return true;
    },

    async deleteVideosBulk(ids) {
        await apiClient.post('/videos/bulk-delete', { ids });
        await this.logActivity('DELETE', 'VIDEO', `Videolar toplu silindi: ${ids.length} adet`);
        return true;
    },

    // Service: User Profiles
    async getProfiles() {
        try { const res = await apiClient.get('/users'); return res.data || []; } catch (e) { return []; }
    },

    async getUserProfile(userId) {
        try { const res = await apiClient.get(`/users/${userId}`); return res.data; } catch (e) { return null; }
    },

    async updateUserProfile(id, updates) {
        const res = await apiClient.patch(`/users/${id}`, updates);
        await this.logActivity('UPDATE', 'USER', `Kullanıcı güncellendi: ${id}`, id);
        return res.data;
    },

    async createUser(email, password, userData) {
        const res = await apiClient.post('/users', { email, password, ...userData });
        await this.logActivity('CREATE', 'USER', `Yeni kullanıcı oluşturuldu: ${email}`, res.data?.id);
        return res.data;
    },

    async deleteUser(id) {
        try {
            await apiClient.delete(`/users/${id}`);
            await this.logActivity('DELETE', 'USER', `Kullanıcı silindi: ${id}`, id);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },



    // Service: Storage
    async uploadImage(file, bucket = 'images') {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await apiClient.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return `${API_BASE}${res.data.url}`;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Dosya yüklenirken hata oluştu.');
        }
    },

    // Service: Gallery Thumbnail Upload
    async uploadGalleryThumbnail(file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await apiClient.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return `${API_BASE}${res.data.url}`;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Dosya yüklenirken hata oluştu.');
        }
    },

    async deleteGalleryThumbnail(url) {
        // No-op: local uploads do not support remote deletion by URL
        return;
    },

    // Service: Gallery Images Upload (Multiple)
    async uploadGalleryImages(files, onProgress) {
        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append('file', files[i]);
            const res = await apiClient.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            uploadedUrls.push(`${API_BASE}${res.data.url}`);
            if (onProgress) onProgress(Math.round(((i + 1) / files.length) * 100));
        }
        return uploadedUrls;
    },

    async deleteGalleryImage(url) {
        // No-op: local uploads do not support remote deletion by URL
        return;
    },

    // Service: Video Upload
    async uploadVideo(file, onProgress) {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await apiClient.post('/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (onProgress) onProgress(100);
            return `${API_BASE}${res.data.url}`;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Video yüklenirken hata oluştu.');
        }
    },

    // Increment gallery views
    async incrementGalleryViews(galleryId) {
        await apiClient.post(`/galleries/${galleryId}/increment-views`).catch(() => { });
    },

    // Increment video views
    async incrementVideoViews(videoId) {
        await apiClient.post(`/videos/${videoId}/increment-views`).catch(() => { });
    },

    // Headlines
    async getHeadlineByNewsId(newsId, type = 1) {
        try {
            const res = await apiClient.get(`/headlines?news_id=${newsId}&type=${type}`);
            const items = res.data?.data || res.data || [];
            return Array.isArray(items) && items[0] ? items[0].order_index : null;
        } catch (e) { return null; }
    },

    async getHeadlines(type = 1) {
        try { const res = await apiClient.get(`/headlines?type=${type}`); return res.data || []; } catch (e) { return []; }
    },

    async getHeadlineAds() {
        try { const res = await apiClient.get('/ads?is_headline=true'); return res.data?.data || []; } catch (e) { return []; }
    },

    async getManset2Ads() {
        try { const res = await apiClient.get('/ads?is_manset_2=true'); return res.data?.data || []; } catch (e) { return []; }
    },

    async getHeadlineSliderAds() {
        try { const res = await apiClient.get('/ads?placement_code=headline_slider&is_active=true'); return res.data?.data || []; } catch (e) { return []; }
    },

    async getManset2SliderAds() {
        try { const res = await apiClient.get('/ads?placement_code=manset_2_slider&is_active=true'); return res.data?.data || []; } catch (e) { return []; }
    },

    async setAdPlacementHeadlineSlot(adId, slot) {
        const res = await apiClient.patch(`/ads/${adId}`, { is_headline: true, headline_slot: slot });
        await this.logActivity('UPDATE', 'HEADLINE', `Reklam manşete eklendi (ID: ${adId}, Slot: ${slot})`, adId);
        return res.data;
    },

    async setAdHeadlineSlot(adId, slot) {
        const res = await apiClient.patch(`/ads/${adId}`, { is_headline: true, headline_slot: slot });
        await this.logActivity('UPDATE', 'HEADLINE', `Reklam manşet slotu güncellendi (ID: ${adId}, Slot: ${slot})`, adId);
        return res.data;
    },

    async setAdManset2Slot(adId, slot) {
        const res = await apiClient.patch(`/ads/${adId}`, { is_manset_2: true, manset_2_slot: slot });
        await this.logActivity('UPDATE', 'HEADLINE', `Reklam Manşet 2 slotu güncellendi (ID: ${adId}, Slot: ${slot})`, adId);
        return res.data;
    },

    async setAdPlacementManset2Slot(adId, slot) {
        // Helper for slider-based ads in Manşet 2
        return this.setAdManset2Slot(adId, slot);
    },

    async addToHeadline(newsId, slotNumber, type = 1) {
        const res = await apiClient.post('/headlines', { news_id: newsId, order_index: slotNumber, type });
        await this.logActivity('CREATE', 'HEADLINE', `Haber ${type === 1 ? 'Manşet 1' : 'Manşet 2'}'e eklendi (ID: ${newsId}, Slot: ${slotNumber})`, newsId);
        return res.data;
    },

    async removeFromHeadline(slotNumber, type = 1) {
        await apiClient.delete(`/headlines?order_index=${slotNumber}&type=${type}`);
        await this.logActivity('DELETE', 'HEADLINE', `Manşetten haber/reklam çıkarıldı (Slot: ${slotNumber})`, null);
        return true;
    },

    async getNextAvailableHeadlineSlot() {
        try {
            const { data: headlines } = await apiClient.get('/headlines?type=1');
            const { data: ads } = await apiClient.get('/ads?is_headline=true');
            const usedSlots = new Set();
            headlines?.forEach(h => usedSlots.add(h.order_index));
            ads?.data?.forEach(a => { if (a.headline_slot) usedSlots.add(a.headline_slot); });
            for (let i = 1; i <= 20; i++) { if (!usedSlots.has(i)) return i; }
            return 21;
        } catch (e) { return 1; }
    },

    async getNextAvailableManset2Slot() {
        try {
            const { data: headlines } = await apiClient.get('/headlines?type=2');
            const { data: ads } = await apiClient.get('/ads?is_manset_2=true');
            const usedSlots = new Set();
            headlines?.forEach(h => usedSlots.add(h.order_index));
            ads?.data?.forEach(a => { if (a.manset_2_slot) usedSlots.add(a.manset_2_slot); });
            for (let i = 1; i <= 20; i++) { if (!usedSlots.has(i)) return i; }
            return 21;
        } catch (e) { return 1; }
    },



    // Categories
    async getCategoryBySlug(slug) {
        try {
            const response = await apiClient.get(`/categories/${slug}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching category by slug:', error);
            return null;
        }
    },

    async getCategories() {
        try {
            // 1. Fetch Categories
            const { data } = await apiClient.get('/categories');
            const categories = data || [];

            if (!categories.length) return [];

            // 2. Fetch Home Layout settings
            let categoryConfig = [];
            try {
                const { data: layoutData } = await apiClient.get('/settings/home_layout');
                if (layoutData && layoutData.value) {
                    const parsed = JSON.parse(layoutData.value);
                    categoryConfig = parsed.categoryConfig || [];
                }
            } catch (e) {
                // Ignore
            }

            // 3. Fetch Category Stats
            let categoryStats = {};
            try {
                const { data: stats } = await apiClient.get('/stats/categories');
                categoryStats = stats || {};
            } catch (e) {
                console.error('Error fetching category stats:', e);
            }

            // 4. Merge Data
            return categories.map(cat => {
                const config = categoryConfig.find(c => c.id === cat.slug);
                const isLayoutEnabled = config ? config.enabled : true;

                let count = 0;
                // Sum matches from stats
                // Robust matching: slug match or normalized name match
                const categorySlug = cat.slug;
                if (categoryStats) {
                    Object.entries(categoryStats).forEach(([key, val]) => {
                        // Assuming simple slug check
                        // Note: backend stats keys are raw category strings from 'news' table.
                        // We must normalize them.
                        // Simple slugify check:
                        if (slugify(key) === categorySlug) {
                            count += val;
                        }
                    });
                }

                return {
                    ...cat,
                    news_count: count,
                    is_visible_on_homepage: count >= 4 && isLayoutEnabled,
                    homepage_config_enabled: isLayoutEnabled
                };
            });

        } catch (err) {
            console.error('Error fetching categories:', err);
            return [];
        }
    },

    async addCategory(name, slug, extraData = {}) {
        try {
            const payload = {
                name,
                slug,
                is_active: true,
                ...extraData
            };
            const response = await apiClient.post('/categories', payload);
            await this.logActivity('CREATE', 'CATEGORY', `Yeni kategori oluşturuldu: ${name}`, response.data.id);
            return response.data;
        } catch (error) {
            console.error('Error adding category:', error);
            throw error;
        }
    },

    async updateCategory(id, updates) {
        try {
            // Fetch name for log if not present? Or just log ID.
            const response = await apiClient.patch(`/categories/${id}`, updates);
            await this.logActivity('UPDATE', 'CATEGORY', `Kategori güncellendi: ${updates.name || id}`, id);
            return response.data;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            await apiClient.delete(`/categories/${id}`);
            await this.logActivity('DELETE', 'CATEGORY', `Kategori silindi: ${id}`, id);
            return true;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    },

    async reorderCategories(updates) {
        try {
            // 1. Update Categories loop
            for (const update of updates) {
                await apiClient.patch(`/categories/${update.id}`, { order_index: update.order_index });
            }

            // 2. Sync with Home Layout
            try {
                const { data: layoutData } = await apiClient.get('/settings/home_layout');
                if (layoutData && layoutData.value) {
                    const layout = JSON.parse(layoutData.value);
                    const categoryConfig = layout.categoryConfig || [];

                    const { data: allCategories } = await apiClient.get('/categories');

                    if (allCategories) {
                        const newCategoryConfig = allCategories.map(cat => {
                            const existing = categoryConfig.find(c => c.id === cat.slug);
                            return {
                                id: cat.slug,
                                title: cat.name,
                                enabled: existing ? existing.enabled : true
                            };
                        });

                        layout.categoryConfig = newCategoryConfig;

                        await apiClient.patch('/settings/home_layout', { value: JSON.stringify(layout) });
                    }
                }
            } catch (syncErr) {
                console.error('Error syncing layout:', syncErr);
            }

            return true;
        } catch (error) {
            console.error('Error reordering categories:', error);
            throw error;
        }
    },

    async removeAdFromHeadline(adId) {
        await apiClient.patch(`/ads/${adId}`, { is_headline: false, headline_slot: null, image_url: null, link_url: null, code: null, is_active: false, name: null, target_page: 'all', device_type: 'all', views: 0, clicks: 0, type: 'image' });
        return true;
    },

    async removeAdPlacementFromHeadline(adId) {
        return this.removeAdFromHeadline(adId);
    },

    async updateNews(id, updates) {
        try {
            const response = await apiClient.patch(`/news/${id}`, updates);
            await this.logActivity('UPDATE', 'NEWS', `Haber güncellendi (ID: ${id})`, id);
            return response.data;
        } catch (error) {
            console.error('Error updating news:', error);
            throw error;
        }
    },


    async getNextAvailableSlot() {
        const manualHeadlines = await this.getHeadlines();
        const headlineAds = await this.getHeadlineAds();
        const usedSlots = new Set();
        manualHeadlines.forEach(h => usedSlots.add(h.slot_number));
        headlineAds.forEach(ad => usedSlots.add(ad.headline_slot));

        for (let i = 1; i <= 15; i++) {
            if (!usedSlots.has(i)) return i;
        }
        return null;
    },

    async duplicateNews(id) {
        try {
            const res = await apiClient.get(`/news/${id}`);
            const original = res.data;
            if (!original) throw new Error('Haber bulunamadı');
            const { id: _, created_at, updated_at, ...newsData } = original;
            const newTitle = `${newsData.title} (Kopya)`;
            const created = await apiClient.post('/news', {
                ...newsData, title: newTitle,
                slug: slugify(newTitle), published_at: null, views: 0
            });
            await this.logActivity('CREATE', 'NEWS', `Haber kopyalandı: ${newTitle}`, created.data.id);
            return created.data;
        } catch (error) {
            console.error('Error duplicating news:', error);
            throw error;
        }
    },

    async duplicateNewsBulk(ids) {
        for (const id of ids) {
            await this.duplicateNews(id);
        }
    },


    async deleteNewsBulk(ids) {
        try {
            await apiClient.post('/news/bulk-delete', { ids });
            await this.logActivity('DELETE', 'NEWS', `Haberler silindi: ${ids.length} adet`);
            return true;
        } catch (error) {
            console.error('Error bulk deleting news:', error);
            throw error;
        }
    },



    // TAGS Management for News
    async getNewsTags(newsId) {
        try { const res = await apiClient.get(`/news/${newsId}/tags`); return res.data || []; } catch (e) { return []; }
    },

    async updateNewsTags(newsId, tagIds) {
        await apiClient.patch(`/news/${newsId}/tags`, { tag_ids: tagIds });
        return true;
    },

    // ----------------------------------------------------------------------
    // Sitemap & RSS Generation
    // ----------------------------------------------------------------------

    // Helper: Slugify for Turkish chars (reused internally)
    _slugify(text) {
        if (!text) return '';
        const trMap = {
            'ç': 'c', 'Ç': 'C',
            'ğ': 'g', 'Ğ': 'G',
            'ş': 's', 'Ş': 'S',
            'ü': 'u', 'Ü': 'U',
            'İ': 'i', 'ı': 'i',
            'ö': 'o', 'Ö': 'O'
        };

        return text.split('').map(char => trMap[char] || char).join('')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    },

    // 1. General Sitemap (All Content)
    async generateSitemap() {
        const baseUrl = 'https://haberfoni.com'; // Enforcing production URL for sitemap
        const now = new Date().toISOString();

        // A. Static Pages
        const staticPages = [
            '/',
            '/tum-haberler',
            '/hakkimizda',
            '/kunye',
            '/iletisim',
            '/reklam',
            '/kariyer',
            '/kvkk',
            '/cerez-politikasi',
            '/video-galeri',
            '/foto-galeri'
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated at: ${now} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

        staticPages.forEach(page => {
            xml += `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
        });

        // B. News (All published)
        try {
            const newsRes = await apiClient.get('/news', { params: { status: 'published', limit: 1000 } });
            const news = newsRes.data?.data || [];
            news.forEach(item => {
                const itemSlug = item.slug || this._slugify(item.title);
                const categorySlug = this._slugify(item.category);
                xml += `  <url>
    <loc>${baseUrl}/kategori/${categorySlug}/${itemSlug}</loc>
    <lastmod>${item.published_at || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
            });
        } catch (e) { console.error('Sitemap news fetch error:', e); }

        // C. Categories
        const categoriesRes = await apiClient.get('/categories').catch(() => ({ data: [] }));
        const categories = categoriesRes.data || [];
        if (categories) {
            categories.forEach(cat => {
                const safeSlug = cat.slug || this._slugify(cat.name);
                xml += `  <url>
    <loc>${baseUrl}/kategori/${safeSlug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;
            });
        }

        // D. Photo Galleries
        const galleriesRes = await apiClient.get('/galleries').catch(() => ({ data: [] }));
        const photoGalleries = galleriesRes.data || [];
        if (photoGalleries.length) {
            photoGalleries.forEach(gallery => {
                const itemSlug = gallery.slug || this._slugify(gallery.title);
                xml += `  <url>
    <loc>${baseUrl}/foto-galeri/${itemSlug}</loc>
    <lastmod>${gallery.created_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
            });
        }

        // E. Video Galleries
        const videosRes = await apiClient.get('/videos').catch(() => ({ data: [] }));
        const videoGalleries = videosRes.data || [];
        if (videoGalleries.length) {
            videoGalleries.forEach(video => {
                const itemSlug = video.slug || this._slugify(video.title);
                xml += `  <url>
    <loc>${baseUrl}/video-galeri/${itemSlug}</loc>
    <lastmod>${video.created_at || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
            });
        }

        // F. Tags
        const tagsRes = await apiClient.get('/tags').catch(() => ({ data: [] }));
        const tags = tagsRes.data || [];
        if (tags.length) {
            tags.forEach(tag => {
                const slug = this._slugify(tag.name);
                xml += `  <url>
    <loc>${baseUrl}/etiket/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;
            });
        }

        // G. Dynamic Pages
        const pagesRes = await apiClient.get('/pages?is_active=true').catch(() => ({ data: [] }));
        const pages = pagesRes.data || [];
        if (pages) {
            pages.forEach(page => {
                if (!['hakkimizda', 'kunye', 'iletisim', 'reklam', 'kariyer', 'kvkk', 'cerez-politikasi'].includes(page.slug)) {
                    xml += `  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${page.updated_at || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
                }
            });
        }

        xml += '</urlset>';
        return xml;
    },

    // 2. Google News Sitemap (Last 48 Hours)
    async generateNewsSitemap() {
        const baseUrl = 'https://haberfoni.com';
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000)).toISOString();

        let news = [];
        try {
            const res = await apiClient.get('/news', { params: { status: 'published', limit: 500, since: twoDaysAgo } });
            news = res.data?.data || [];
        } catch (e) { console.error('News sitemap fetch error:', e); }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;

        if (news) {
            news.forEach(item => {
                const itemSlug = item.slug || this._slugify(item.title);
                const categorySlug = this._slugify(item.category);
                const date = item.published_at ? new Date(item.published_at).toISOString() : new Date().toISOString();

                xml += `  <url>
    <loc>${baseUrl}/kategori/${categorySlug}/${itemSlug}</loc>
    <news:news>
      <news:publication>
        <news:name>Haberfoni</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${date}</news:publication_date>
      <news:title>${item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')}</news:title>
    </news:news>
  </url>
`;
            });
        }

        xml += '</urlset>';
        return xml;
    },

    // 3. RSS Feed
    async generateRSS() {
        const baseUrl = 'https://haberfoni.com';
        const now = new Date().toUTCString();

        // Fetch latest 50 items
        let newsList = [];
        try {
            const res = await apiClient.get('/news', { params: { status: 'published', limit: 50 } });
            newsList = res.data?.data || [];
        } catch (e) { console.error('RSS fetch error:', e); }

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>Haberfoni</title>
  <link>${baseUrl}</link>
  <description>Haberfoni - Güncel Haberler, Son Dakika Gelişmeleri</description>
  <language>tr</language>
  <lastBuildDate>${now}</lastBuildDate>
  <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
`;

        if (newsList) {
            newsList.forEach(item => {
                const itemSlug = item.slug || this._slugify(item.title);
                const categorySlug = this._slugify(item.category);
                const link = `${baseUrl}/kategori/${categorySlug}/${itemSlug}`;
                const pubDate = item.published_at ? new Date(item.published_at).toUTCString() : now;

                // Construct absolute image URL
                let imageUrl = item.image_url;
                if (imageUrl && !imageUrl.startsWith('http')) {
                    // Assuming standard supabase storage or local path, best effort to make it absolute
                    imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                }

                xml += `  <item>
    <title>${item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description><![CDATA[${item.summary || ''}]]></description>
    <pubDate>${pubDate}</pubDate>
    <category>${item.category}</category>
    ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ''}
    ${imageUrl ? `<enclosure url="${imageUrl}" type="image/jpeg" />` : ''}
  </item>
`;
            });
        }

        xml += `</channel>
</rss>`;
        return xml;
    },

    async deleteAdPlacement(id) {
        try {
            await apiClient.delete(`/ads/${id}`);
        } catch (error) {
            console.error('Error deleting ad placement:', error);
            throw error;
        }

        await this.logActivity('DELETE', 'ADS', `Reklam alanı silindi: ${id}`, id);

        return true;
    },

    // Service: Contact Messages
    async getContactMessages() {
        try { const res = await apiClient.get('/contact-messages'); return res.data || []; } catch (e) { return []; }
    },

    async createContactMessage(messageData) {
        const res = await apiClient.post('/contact-messages', messageData);
        return res.data;
    },

    async deleteContactMessage(id) {
        try {
            await apiClient.delete(`/contact-messages/${id}`);
            await this.logActivity('DELETE', 'MESSAGE', `İletişim mesajı silindi (ID: ${id})`, id);
        } catch (error) {
            console.error('Error deleting contact message:', error);
            throw error;
        }
    },

    async markContactMessageAsRead(id) {
        try {
            const response = await apiClient.patch(`/contact-messages/${id}`, { is_read: true });
            await this.logActivity('UPDATE', 'MESSAGE', `Mesaj okundu olarak işaretlendi (ID: ${id})`, id);
            return response.data;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    },

    async getUnreadCounts() {
        try {
            const msgs = await apiClient.get('/contact-messages?is_read=false').catch(() => ({ data: [] }));
            const comments = await apiClient.get('/comments?is_approved=false').catch(() => ({ data: [] }));
            return {
                messages: Array.isArray(msgs.data) ? msgs.data.length : 0,
                comments: Array.isArray(comments.data) ? comments.data.length : 0
            };
        } catch (e) {
            return { messages: 0, comments: 0 };
        }
    },
    async deleteUser(userId) {
        try {
            await apiClient.delete(`/users/${userId}`);
            return true;
        } catch (error) { throw error; }
    },

    // Service: Activity Logs
    async logActivity(actionType, entityType, description, entityId = null) {
        try {
            await apiClient.post('/activity-logs', {
                action_type: actionType, entity_type: entityType,
                description, entity_id: entityId
            }).catch(() => { });
        } catch (err) {
            // Fail silently
        }
    },

    async getActivityLogs(page = 1, limit = 20) {
        try {
            const res = await apiClient.get('/activity-logs', { params: { page, limit } });
            return { data: res.data?.data || [], count: res.data?.meta?.total || 0 };
        } catch (e) { return { data: [], count: 0 }; }
    },

    async clearActivityLogs() {
        await apiClient.delete('/activity-logs');
        return true;
    },

    // Service: Email Settings
    async getEmailSettings() {
        try { const res = await apiClient.get('/email-settings'); return res.data; } catch (e) { return null; }
    },

    async updateEmailSettings(settings) {
        await apiClient.patch('/email-settings', settings);
        await this.logActivity('UPDATE', 'SETTINGS', 'Email ayarları güncellendi', 1);
        return true;
    },

    // Service: Redirects (duplicate block removed above, these delegate to the first ones)
    async getRedirects() {
        try { const res = await apiClient.get('/redirects'); return res.data || []; } catch (e) { return []; }
    },

    async addRedirect(redirectData) {
        const res = await apiClient.post('/redirects', redirectData);
        await this.logActivity('CREATE', 'REDIRECT', `Yönlendirme eklendi`, res.data?.id);
        return res.data;
    },

    async deleteRedirect(id) {
        await apiClient.delete(`/redirects/${id}`);
        await this.logActivity('DELETE', 'REDIRECT', `Yönlendirme silindi: ${id}`, id);
        return true;
    },


    // Bot Mappings
    async getBotMappings(sourceName) {
        try {
            const res = await apiClient.get('/bot/mappings/' + sourceName);
            return res.data;
        } catch (error) {
            console.error('Error fetching bot mappings:', error);
            return [];
        }
    },

    async addBotMapping(mapping) {
        try {
            const res = await apiClient.post('/bot/mappings', mapping);
            return res.data;
        } catch (error) {
            console.error('Error adding bot mapping:', error);
            throw error;
        }
    },

    async deleteBotMapping(id) {
        try {
            await apiClient.delete('/bot/mappings/' + id);
        } catch (error) {
            console.error('Error deleting bot mapping:', error);
            throw error;
        }
    },

    async getBotSettings() {
        try {
            const res = await apiClient.get('/bot/settings');
            return res.data;
        } catch (error) {
            console.error('Error fetching bot settings:', error);
            return [];
        }
    },

    async updateBotSetting(id, data) {
        try {
            const res = await apiClient.post('/bot/settings/' + id, data);
            return res.data;
        } catch (error) {
            console.error('Error updating bot setting:', error);
            throw error;
        }
    },

    // Service: SEO Files (robots.txt, ads.txt)
    async getSeoFile(type) {
        // Since we don't have a DB table for this in the provided context, 
        // usually these are files or settings. 
        // Assuming they are stored in 'site_settings' or unique table based on SeoFilesPage content.
        // I will assume SeoFilesPage uses 'site_settings' or specific table.
        // Let's wait for SeoFilesPage view to be precise. 
        // For now, I will add the method stub and fill it after viewing the file.
        // But to be efficient, I will use generic updateSetting for now if it's key-value.
        return null;
    },

    // Bot Commands
    async triggerBot(command = 'FORCE_RUN') {
        try {
            const response = await apiClient.post('/bot/run');
            return response.data;
        } catch (error) {
            console.error('Trigger bot failed:', error);
            throw error;
        }
    },

    async getBotStatus() {
        try {
            const response = await apiClient.get('/bot/status');
            return response.data;
        } catch (error) {
            console.error('Error fetching bot status:', error);
            return null;
        }
    },

    async getDashboardStats() {
        try {
            const response = await apiClient.get('/stats/dashboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return { totalViews: 0, activeNews: 0, subscribers: 0, totalComments: 0 };
        }
    }
};
