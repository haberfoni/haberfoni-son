import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Video, AlertTriangle, Eye, Trash2, X } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { slugify } from '../../utils/slugify';
import { getYouTubeId } from '../../utils/videoUtils';
import RichTextEditor from '../../components/RichTextEditor';
import TagSelector from '../../components/admin/TagSelector';
import SeoPreview from '../../components/admin/SeoPreview';

const NewsEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditing = !!id;
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [manualSlug, setManualSlug] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        summary: '',
        content: '',
        category: 'gundem',
        image_url: '',
        is_published: false, // Internal UI state
        is_sticky: false,   // Internal UI state - also manages headlines table
        video_url: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: ''
    });

    const [headlineSlot, setHeadlineSlot] = useState(null); // Track if news is in headlines
    const [selectedTagIds, setSelectedTagIds] = useState([]); // Selected tags

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await adminService.getCategories();
            if (data && data.length > 0) {
                setCategories(data);
            } else {
                // Fallback if no categories in DB yet
                setCategories([
                    { name: 'Gündem', slug: 'gundem' },
                    { name: 'Spor', slug: 'spor' },
                    { name: 'Ekonomi', slug: 'ekonomi' },
                    { name: 'Magazin', slug: 'magazin' },
                    { name: 'Dünya', slug: 'dunya' },
                    { name: 'Teknoloji', slug: 'teknoloji' },
                    { name: 'Sağlık', slug: 'saglik' }
                ]);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
            // Fallback list
            setCategories([
                { name: 'Gündem', slug: 'gundem' },
                { name: 'Spor', slug: 'spor' },
                { name: 'Ekonomi', slug: 'ekonomi' },
                { name: 'Magazin', slug: 'magazin' },
                { name: 'Dünya', slug: 'dunya' },
                { name: 'Teknoloji', slug: 'teknoloji' },
                { name: 'Sağlık', slug: 'saglik' }
            ]);
        }
    };

    useEffect(() => {
        if (isEditing) {
            loadNews();
        }
    }, [id]);

    const loadNews = async () => {
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            // Check if news is in headlines
            const slot = await adminService.getHeadlineByNewsId(id);
            setHeadlineSlot(slot);

            // Load tags
            const tags = await adminService.getNewsTags(id);
            setSelectedTagIds(tags || []);

            // Map DB columns to UI state
            const generatedSlug = slugify(data.title || '');
            const hasCustomSlug = data.slug && data.slug !== generatedSlug;

            // Destructure is_slider to prevent it from being spread into formData
            const { is_slider, published_at, ...restData } = data;

            setFormData({
                ...restData,
                // Ensure slug is populated
                slug: data.slug || generatedSlug,
                // If published_at is set, it's published.
                is_published: !!published_at,
                // Map headline presence to is_sticky (overrides is_slider)
                // Map headline presence to is_sticky (overrides is_slider)
                is_sticky: !!slot,
                seo_title: data.seo_title || data.title || '',
                seo_description: data.seo_description || data.summary || '',
                seo_keywords: data.seo_keywords || ''
            });

            // If the saved slug is different from what we would generate, 
            // it means the user manually set it. Enable manual mode.
            if (hasCustomSlug) {
                setManualSlug(true);
            }
        } catch (error) {
            console.error('Error loading news:', error);
            setMessage({ type: 'error', text: 'Haber yüklenemedi.' });
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = () => {
        setFormData(prev => ({ ...prev, is_published: !prev.is_published }));
    };

    const handleTitleChange = async (e) => {
        const title = e.target.value;

        // Auto-generate slug if Manual Mode is OFF
        // (Even if editing, if manual is OFF, we sync. Standard behavior is usually sticky, 
        // but user requested "revert to auto" behavior implied full sync).
        // To be safe for SEO on existing articles, we might usually restrict this, 
        // but the user's "test2" workflow suggests they want control or auto.
        if (!manualSlug) {
            const slug = slugify(title);
            setFormData(prev => ({
                ...prev,
                title,
                slug,
                // Auto-sync SEO Title if it was empty or same as previous title
                seo_title: (!prev.seo_title || prev.seo_title === prev.title) ? title : prev.seo_title
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                title,
                seo_title: (!prev.seo_title || prev.seo_title === prev.title) ? title : prev.seo_title
            }));
        }

        // Debounce or just check on significant change?
        if (title.length > 10) {
            checkDuplicate(title);
        } else {
            setDuplicateWarning(null);
        }
    };

    const checkDuplicate = async (title) => {
        try {
            const duplicate = await adminService.checkDuplicateNews(title, id);
            if (duplicate) {
                setDuplicateWarning(`Dikkat: "${title}" başlığına benzer başka bir haber var (ID: ${duplicate.id}).`);
            } else {
                setDuplicateWarning(null);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Map UI state back to DB columns
            const dbPayload = {
                title: formData.title,
                summary: formData.summary,
                content: formData.content,
                category: formData.category,
                media_type: formData.media_type || 'image',
                image_url: formData.image_url,
                video_url: formData.video_url,
                slug: formData.slug, // SAVE THE CUSTOM SLUG

                // DATA MAPPING
                published_at: formData.is_published ? new Date().toISOString() : null,
                is_slider: formData.is_sticky,
                published_at: formData.is_published ? new Date().toISOString() : null,
                // DATA MAPPING
                published_at: formData.is_published ? new Date().toISOString() : null,
                is_slider: formData.is_sticky,
                author_id: !isEditing ? user?.id : undefined, // Only set author on creation
                updater_id: user?.id, // Track who updated it

                // SEO Fields - Fallback Logic
                seo_title: formData.seo_title || formData.title,
                seo_description: formData.seo_description || formData.summary || formData.content?.replace(/<[^>]*>?/gm, '').slice(0, 200) || '',
                seo_keywords: formData.seo_keywords
            };

            // DEBUG: Log what we're about to save
            console.log('💾 Saving news with:', {
                is_published: formData.is_published,
                is_sticky: formData.is_sticky,
                is_slider: dbPayload.is_slider,
                published_at: dbPayload.published_at
            });

            // AUTO-THUMBNAIL LOGIC:
            // If user provided a video URL but NO image, try to fetch YouTube thumbnail.
            if (!dbPayload.image_url && dbPayload.video_url) {
                const yId = getYouTubeId(dbPayload.video_url);
                if (yId) {
                    // Use HQ default which is reliable. Maxres might be 404 for some videos.
                    dbPayload.image_url = `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
                }
            }

            // Exclude slug since column is missing
            // delete dbPayload.slug; // redundant since we didn't include it in dbPayload above

            let result;
            const trySave = async (payload) => {
                if (isEditing) {
                    const { data, error } = await supabase
                        .from('news')
                        .update(payload)
                        .eq('id', id)
                        .select();
                    if (error) throw error;
                    return data && data.length > 0 ? data[0] : null;
                } else {
                    const { data, error } = await supabase
                        .from('news')
                        .insert(payload)
                        .select();
                    if (error) throw error;
                    return data && data.length > 0 ? data[0] : null;
                }
            };

            try {
                result = await trySave(dbPayload);

                // Log Activity
                if (result) {
                    const action = isEditing ? 'UPDATE' : 'CREATE';
                    const desc = isEditing ? `Haber güncellendi: ${formData.title}` : `Yeni haber oluşturuldu: ${formData.title}`;
                    // Fire and forget log to not block UI
                    adminService.logActivity(action, 'NEWS', desc, result.id).catch(console.error);
                }
            } catch (error) {
                // RETRY LOGIC: If 'media_type' column is missing, remove it and try again.
                if (error.message && error.message.includes('media_type')) {
                    console.warn('media_type column missing, retrying without it...');
                    const fallbackPayload = { ...dbPayload };
                    delete fallbackPayload.media_type;
                    result = await trySave(fallbackPayload);

                    // Log Activity for retry success
                    if (result) {
                        const action = isEditing ? 'UPDATE' : 'CREATE';
                        const desc = isEditing ? `Haber güncellendi (Retry): ${formData.title}` : `Yeni haber oluşturuldu (Retry): ${formData.title}`;
                        adminService.logActivity(action, 'NEWS', desc, result.id).catch(console.error);
                    }
                } else {
                    throw error; // Re-throw other errors
                }
            }

            // HEADLINE MANAGEMENT: Add/remove from headlines based on is_sticky
            const newsId = result?.id || id;
            if (formData.is_sticky) {
                // Add to headlines
                if (!headlineSlot) {
                    const nextSlot = await adminService.getNextAvailableSlot();
                    if (nextSlot) {
                        await adminService.addToHeadline(newsId, nextSlot);
                        console.log(`Added to headline slot ${nextSlot}`);
                    } else {
                        setMessage({ type: 'warning', text: 'Haber kaydedildi ancak tüm manşet slotları dolu.' });
                    }
                }
            } else {
                // Remove from headlines if it was there
                if (headlineSlot) {
                    await adminService.removeFromHeadline(headlineSlot);
                    console.log(`Removed from headline slot ${headlineSlot}`);
                }
            }

            // Save Tags
            if (selectedTagIds) {
                await adminService.updateNewsTags(newsId, selectedTagIds);
            }

            setMessage({ type: 'success', text: 'Haber başarıyla kaydedildi.' });
            if (!isEditing) {
                setTimeout(() => navigate('/admin/news'), 1000);
            }
        } catch (error) {
            console.error('Error saving news:', error);
            setMessage({ type: 'error', text: 'Kaydedilirken hata oluştu: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/admin/news')} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
                        <ArrowLeft size={20} className="mr-1" />
                        <span>Listeye Dön</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h1>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Top Publish Button Removed as per request */}
                </div>
            </div>

            {
                message.text && (
                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message.text}
                    </div>
                )
            }

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary ${duplicateWarning ? 'border-yellow-400 focus:ring-yellow-400' : 'border-gray-300'}`}
                            placeholder="Haber başlığı..."
                        />
                        {duplicateWarning && (
                            <div className="mt-2 text-sm text-yellow-700 flex items-center">
                                <AlertTriangle size={16} className="mr-1" />
                                {duplicateWarning}
                            </div>
                        )}
                    </div>

                    {/* Links (Slug) */}
                    {/* Links (Slug) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Haber Linki (URL)</label>

                        {/* URL Preview (Always Visible, Read-only if custom not active) */}
                        <div className="flex items-center space-x-0.5 mb-2 p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600 break-all">
                            <span className="shrink-0">/kategori/</span>
                            <span className="font-medium text-gray-700 shrink-0">{slugify(formData.category || 'kategori')}/</span>
                            <span className="font-bold text-gray-900">{formData.slug}</span>
                        </div>

                        {/* Manual Toggle */}
                        <div className="flex items-center space-x-2 mb-2">
                            <input
                                type="checkbox"
                                id="manual-slug"
                                checked={manualSlug}
                                onChange={(e) => {
                                    setManualSlug(e.target.checked);
                                    // If unchecking, revert slug to title-based slug immediately
                                    if (!e.target.checked) {
                                        setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
                                    }
                                }}
                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <label htmlFor="manual-slug" className="text-sm text-gray-700 select-none cursor-pointer">
                                Manuel Link Belirle
                            </label>
                        </div>

                        {/* Editable Input (Only if Manual is checked) */}
                        {manualSlug && (
                            <div className="flex rounded-md shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hidden md:inline-flex">
                                    .../{slugify(formData.category || 'kategori')}/
                                </span>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-primary focus:border-primary sm:text-sm font-mono text-gray-900"
                                    placeholder="ozel-link-adresi"
                                />
                            </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {manualSlug
                                ? "Özel link belirliyorsunuz. Başlık değişse bile bu link sabit kalır."
                                : "Link otomatik olarak başlıktan oluşturuluyor. Özel bir adres belirlemek için kutucuğu işaretleyin."}
                        </p>
                    </div>

                    {/* Category & Sticky */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                            <select
                                value={formData.category} // CAUTION: If DB has category_id, this might be broken for new items or updates?
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary capitalize"
                            >
                                {categories.map(cat => (
                                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col justify-center space-y-3 pt-4">
                            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.is_published}
                                    onChange={(e) => {
                                        const isPublished = e.target.checked;
                                        setFormData({
                                            ...formData,
                                            is_published: isPublished,
                                            // Auto-uncheck slider if unpublishing
                                            is_sticky: isPublished ? formData.is_sticky : false
                                        });
                                    }}
                                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-900">Yayınla</span>
                            </label>

                            <label className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-colors ${formData.is_published ? 'cursor-pointer hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_sticky}
                                    disabled={!formData.is_published}
                                    onChange={(e) => setFormData({ ...formData, is_sticky: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">Manşete eklenecek mi?</span>
                                    {!formData.is_published && (
                                        <span className="text-xs text-amber-600 mt-0.5">⚠️ Önce haberi yayınlamalısınız</span>
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Özet</label>
                            <button
                                type="button"
                                onClick={() => {
                                    const stripped = formData.content?.replace(/<[^>]*>?/gm, '').slice(0, 200) || '';
                                    if (!stripped) {
                                        alert('İçerik henüz boş.');
                                        return;
                                    }
                                    setFormData(prev => ({
                                        ...prev,
                                        summary: stripped,
                                        seo_description: stripped
                                    }));
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                                İçerikten Üret
                            </button>
                        </div>
                        <textarea
                            rows="2"
                            value={formData.summary}
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    summary: val,
                                    // Only auto-fill SEO description if it's currently EMPTY. 
                                    // If user wrote something manually, leave it alone.
                                    seo_description: !prev.seo_description ? val : prev.seo_description
                                }));
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="Kısa özet..."
                        />
                    </div>




                    {/* Media Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medya Türü</label>
                        <div className="flex space-x-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, media_type: 'image' })}
                                className={`px-4 py-2 rounded-lg border flex items-center ${(!formData.media_type || formData.media_type === 'image') ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
                            >
                                <ImageIcon size={18} className="mr-2" />
                                Görsel
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, media_type: 'video' })}
                                className={`px-4 py-2 rounded-lg border flex items-center ${formData.media_type === 'video' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
                            >
                                <Video size={18} className="mr-2" />
                                Video
                            </button>
                        </div>
                    </div>

                    {/* Image Upload - Hidden if Video is selected (auto-thumbnail used instead) */}
                    {formData.media_type !== 'video' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Haber Görseli
                            </label>
                            <div className="flex items-start space-x-4">
                                {/* Preview Box */}
                                <div className="w-40 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                    {formData.image_url ? (
                                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <ImageIcon size={24} className="mb-1" />
                                            <span className="text-xs">Görsel Yok</span>
                                        </div>
                                    )}
                                </div>

                                {/* Upload Button */}
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <label className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors relative">
                                            <span className={`text-sm font-medium text-gray-700 ${uploading ? 'opacity-0' : 'opacity-100'}`}>
                                                {formData.image_url ? 'Görseli Değiştir' : 'Görsel Yükle'}
                                            </span>
                                            {uploading && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploading}
                                                onChange={async (e) => {
                                                    if (!e.target.files || e.target.files.length === 0) return;

                                                    const file = e.target.files[0];
                                                    const maxSize = 1 * 1024 * 1024; // 1MB in bytes

                                                    // Check file size
                                                    if (file.size > maxSize) {
                                                        alert(`Dosya boyutu çok büyük! Maksimum 1MB yükleyebilirsiniz. Seçilen dosya: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                                                        e.target.value = ''; // Reset input
                                                        return;
                                                    }

                                                    setUploading(true);
                                                    try {
                                                        const publicUrl = await adminService.uploadImage(file);
                                                        setFormData(prev => ({ ...prev, image_url: publicUrl }));
                                                    } catch (error) {
                                                        console.error('Upload failed:', error);
                                                        // Helpful error message for missing bucket
                                                        if (error.statusCode === '404' || error.message.includes('Bucket not found')) {
                                                            alert('Hata: "images" adında bir depolama alanı (Bucket) bulunamadı. Lütfen Supabase Storage panelinde "images" adında public bir bucket oluşturun.');
                                                        } else {
                                                            alert('Görsel yüklenirken bir hata oluştu: ' + error.message);
                                                        }
                                                    } finally {
                                                        setUploading(false);
                                                    }
                                                }}
                                            />
                                        </label>

                                        {/* Remove Image Button */}
                                        {formData.image_url && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (window.confirm('Görseli kaldırmak istediğinize emin misiniz?')) {
                                                        setFormData(prev => ({ ...prev, image_url: null }));
                                                    }
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                                title="Görseli Kaldır"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Önerilen boyut: 800x450px. JPG veya PNG.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Video URL (Only visible if Video is selected) */}
                    {formData.media_type === 'video' && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 relative">
                            <label className="block text-sm font-medium text-blue-900 mb-1">Video Linki (YouTube)</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={formData.video_url || ''}
                                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                                {formData.video_url && (
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, video_url: '' })}
                                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                        title="Linki Temizle"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                                Haber detayında en üstte (Kapak) görünecek video için linki buraya giriniz.
                            </p>

                            {/* Live Video Preview */}
                            {formData.video_url && (
                                <div className="mt-4 rounded-lg overflow-hidden bg-black shadow-sm max-w-md mx-auto aspect-video relative group">
                                    {getYouTubeId(formData.video_url) ? (
                                        <iframe
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${getYouTubeId(formData.video_url)}`}
                                            title="Video Preview"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-white/50 text-sm">
                                            <div className="text-center">
                                                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <span>Geçersiz YouTube Linki</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Conflict Warning */}
                            {formData.media_type === 'video' && formData.image_url && !formData.video_url && (
                                <div className="mt-2 flex items-start space-x-2 text-amber-600 text-xs">
                                    <AlertTriangle size={14} className="mt-0.5" />
                                    <span>Video seçtiniz ancak henüz link girmediniz. Mevcut görsel kullanılacaktır.</span>
                                </div>
                            )}
                            {formData.media_type === 'video' && formData.image_url && formData.video_url && (
                                <div className="mt-2 flex items-start space-x-2 text-blue-600 text-xs">
                                    <AlertTriangle size={14} className="mt-0.5" />
                                    <span>Video aktif. Yüklediğiniz görsel <b>sadece liste kapak görseli</b> olarak kullanılacaktır. Detay sayfasında video görünecektir.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content (Rich Text) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(content) => {
                                setFormData(prev => {
                                    const stripped = content.replace(/<[^>]*>?/gm, '').slice(0, 200);

                                    // 1. Auto-update Summary logic
                                    // Update summary if it's currently empty OR if it matches the previous content prefix (assuming auto-generated)
                                    const prevStripped = prev.content?.replace(/<[^>]*>?/gm, '').slice(0, 200) || '';
                                    const isSummaryAuto = !prev.summary || prev.summary === prevStripped;
                                    const newSummary = isSummaryAuto ? stripped : prev.summary;

                                    // 2. Auto-update SEO Description logic (Smart Fallback)
                                    // If user hasn't entered a custom SEO description (is empty),
                                    // keep it synced with the Summary (which is either manual or content-derived).
                                    // If user HAS entered a custom value, do not touch it.
                                    const newSeoDesc = !prev.seo_description ? newSummary : prev.seo_description;

                                    return {
                                        ...prev,
                                        content: content,
                                        summary: newSummary,
                                        seo_description: newSeoDesc
                                    };
                                });
                            }}
                            placeholder="Haber içeriğini buraya yazın..."
                        />
                        <p className="text-xs text-gray-400 mt-1">Metin editörünü kullanarak haberinizi düzenleyebilir veya "Kaynak" butonu ile HTML koduna müdahale edebilirsiniz.</p>
                    </div>

                    {/* SEO Settings - Auto-populated */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                            <span className="mr-2">🔎</span> SEO Ayarları
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Başlığı</label>
                                <input
                                    type="text"
                                    value={formData.seo_title}
                                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                    placeholder="Google'da görünecek başlık"
                                />
                                <p className="text-xs text-gray-500 mt-1">Otomatik olarak haber başlığından alınır. Sona otomatik olarak " | Site Adı" eklenir.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Anahtar Kelimeler</label>
                                <input
                                    type="text"
                                    value={formData.seo_keywords}
                                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                    placeholder="virgül, ile, ayırın"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">SEO Açıklaması</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const stripped = formData.content?.replace(/<[^>]*>?/gm, '').slice(0, 200) || '';
                                        if (!stripped) {
                                            alert('İçerik henüz boş.');
                                            return;
                                        }
                                        setFormData(prev => ({
                                            ...prev,
                                            seo_description: stripped
                                        }));
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                >
                                    İçerikten Çek
                                </button>
                            </div>
                            <textarea
                                rows="2"
                                value={formData.seo_description}
                                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                placeholder="Google'da görünecek açıklama"
                            />
                            <p className="text-xs text-gray-500 mt-1">Otomatik olarak özetten alınır (Max 200 karakter önerilir).</p>
                        </div>

                        {/* SEO Preview */}
                        <div className="col-span-1 md:col-span-2">
                            <SeoPreview
                                title={formData.seo_title || formData.title}
                                description={formData.seo_description || formData.summary}
                                image={formData.image_url}
                                url={`/kategori/${formData.category}/${formData.slug}`}
                                date={formData.published_at || new Date().toISOString()}
                            />
                        </div>
                    </div>

                    {/* Tag Selector */}
                    <div>
                        <TagSelector
                            selectedTagIds={selectedTagIds}
                            onChange={setSelectedTagIds}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/news')}
                        className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        İptal
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
                    >
                        <Save size={18} />
                        <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                    </button>
                </div>
            </form>
        </div >
    );
};

export default NewsEditPage;
