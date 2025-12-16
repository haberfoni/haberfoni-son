import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Plus, Trash2, GripVertical } from 'lucide-react';
import { adminService } from '../../services/adminService';
import RichTextEditor from '../../components/RichTextEditor';
import SeoPreview from '../../components/admin/SeoPreview';
import { slugify } from '../../utils/slugify';

const PhotoGalleryEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',

        thumbnail_url: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: ''
    });

    // Manage array of images
    const [images, setImages] = useState([
        { image_url: '', caption: '' }
    ]);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Bulk Upload State
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkUrls, setBulkUrls] = useState('');

    // File Upload State
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Thumbnail upload state
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    useEffect(() => {
        if (isEditing) {
            loadGallery();
        }
    }, [id]);

    const loadGallery = async () => {
        try {
            const data = await adminService.getPhotoGallery(id);
            setFormData({
                title: data.title,

                thumbnail_url: data.thumbnail_url || '',
                seo_title: data.seo_title || data.title || '',
                seo_description: data.seo_description || '',
                seo_keywords: data.seo_keywords || ''
            });
            // Set thumbnail preview if exists
            if (data.thumbnail_url) {
                setThumbnailPreview(data.thumbnail_url);
            }
            if (data.gallery_images && data.gallery_images.length > 0) {
                setImages(data.gallery_images.map(img => ({
                    image_url: img.image_url,
                    caption: img.caption || ''
                })));
            } else {
                setImages([{ image_url: '', caption: '' }]);
            }
        } catch (error) {
            console.error('Error loading gallery:', error);
            setMessage({ type: 'error', text: 'Galeri yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAdd = () => {
        if (!bulkUrls.trim()) return;

        // Split by newline and clean up
        const urls = bulkUrls.split(/\r?\n/)
            .map(url => url.trim())
            .filter(url => url !== '')
            .map(url => {
                // Remove potential numbering (e.g., "1. https://..." -> "https://...")
                return url.replace(/^\d+[\.\)\-\s]+\s*/, '');
            });

        if (urls.length === 0) return;

        const newImages = urls.map(url => ({ image_url: url, caption: '' }));

        // Remove the default empty row if it exists and is the only row
        let currentImages = [...images];
        if (currentImages.length === 1 && !currentImages[0].image_url) {
            currentImages = [];
        }

        setImages([...currentImages, ...newImages]);
        setBulkUrls('');
        setShowBulkModal(false);
    };

    // Images handling
    // Images handling
    const handleImageChange = (index, field, value) => {
        const newImages = [...images];
        newImages[index][field] = value;
        setImages(newImages);
    };

    const handleUrlPaste = (e, index) => {
        const pasteData = e.clipboardData.getData('text');

        // Parse potential URLs
        const urls = pasteData.split(/\r?\n/)
            .map(url => url.trim())
            .filter(url => url !== '')
            .map(url => url.replace(/^\d+[\.\)\-\s]+\s*/, '')); // Clean numbering

        // Smart Paste: Only intervene if we have MULTIPLE URLs
        if (urls.length > 1) {
            e.preventDefault(); // Stop standard paste

            const newImages = [...images];

            // Update current row with first URL
            // Ensure we update immutably just in case
            newImages[index] = { ...newImages[index], image_url: urls[0] };

            // Insert remaining URLs as new rows
            const newRows = urls.slice(1).map(url => ({ image_url: url, caption: '' }));
            newImages.splice(index + 1, 0, ...newRows);

            setImages(newImages);
            setMessage({ type: 'success', text: `${urls.length} link başarıyla ayrıştırılıp eklendi.` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };



    const addImageRow = () => {
        setImages([...images, { image_url: '', caption: '' }]);
    };

    const removeImageRow = (index) => {
        if (images.length === 1) return; // Prevent deleting last row
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    // Handle multiple file upload
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        setUploadProgress(0);
        setMessage({ type: '', text: '' });

        try {
            // Upload files
            const uploadedUrls = await adminService.uploadGalleryImages(
                files,
                (progress) => setUploadProgress(progress)
            );

            // Add uploaded images to the list
            const newImages = uploadedUrls.map(url => ({ image_url: url, caption: '' }));

            // Remove the default empty row if it exists and is the only row
            let currentImages = [...images];
            if (currentImages.length === 1 && !currentImages[0].image_url) {
                currentImages = [];
            }

            setImages([...currentImages, ...newImages]);
            setMessage({ type: 'success', text: `${files.length} fotoğraf başarıyla yüklendi.` });

            // Reset input
            e.target.value = '';
        } catch (error) {
            console.error('Error uploading files:', error);
            setMessage({ type: 'error', text: error.message || 'Dosya yüklenirken hata oluştu.' });
        } finally {
            setUploadingImages(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            let thumbnailUrl = formData.thumbnail_url;

            // Upload thumbnail if new file selected
            if (thumbnailFile) {
                try {
                    thumbnailUrl = await adminService.uploadGalleryThumbnail(thumbnailFile);

                    // Delete old thumbnail if updating
                    if (isEditing && formData.thumbnail_url) {
                        await adminService.deleteGalleryThumbnail(formData.thumbnail_url);
                    }
                } catch (uploadError) {
                    setMessage({ type: 'error', text: uploadError.message });
                    setSaving(false);
                    return;
                }
            }

            // Filter empty images
            const validImages = images.filter(img => img.image_url.trim() !== '');

            const payload = {
                title: formData.title,
                thumbnail_url: thumbnailUrl || (validImages.length > 0 ? validImages[0].image_url : null),

                seo_title: formData.seo_title || null,
                seo_description: formData.seo_description || null,
                seo_keywords: formData.seo_keywords || null,
                // Add views for new records if not present
                ...(!isEditing && { views: 0 })
            };

            if (isEditing) {
                await adminService.updatePhotoGallery(id, payload, validImages);
            } else {
                await adminService.createPhotoGallery(payload, validImages);
            }

            setMessage({ type: 'success', text: 'Galeri başarıyla kaydedildi.' });
            setTimeout(() => navigate('/admin/photo-galleries'), 1000);
        } catch (error) {
            console.error('Error saving gallery:', error);
            setMessage({ type: 'error', text: 'Hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate('/admin/photo-galleries')} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft size={20} className="mr-1" />
                    <span>Listeye Dön</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Galeriyi Düzenle' : 'Yeni Foto Galeri'}</h1>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Main Settings Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Galeri Ayarları</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Galeri Başlığı</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData(prev => ({
                                        ...prev,
                                        title: val,
                                        seo_title: (!prev.seo_title || prev.seo_title === prev.title) ? val : prev.seo_title
                                    }));
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="Örn: Haftanın En İyi Doğa Fotoğrafları"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Görseli (Opsiyonel)</label>

                            {/* Preview */}
                            {(thumbnailPreview || formData.thumbnail_url) && (
                                <div className="mb-3 relative inline-block">
                                    <img
                                        src={thumbnailPreview || formData.thumbnail_url}
                                        alt="Kapak önizleme"
                                        className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setThumbnailFile(null);
                                            setThumbnailPreview('');
                                            setFormData({ ...formData, thumbnail_url: '' });
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                        title="Kaldır"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}

                            <label className="cursor-pointer block relative">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary hover:bg-gray-50 transition-colors text-center">
                                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-sm text-gray-600">
                                        {thumbnailFile ? thumbnailFile.name : 'Kapak görseli seçin'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Max 1MB - JPEG, PNG, WebP</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        if (file.size > 1024 * 1024) {
                                            setMessage({ type: 'error', text: 'Kapak görseli 1MB\'dan büyük olamaz.' });
                                            return;
                                        }
                                        setThumbnailFile(file);
                                        const reader = new FileReader();
                                        reader.onloadend = () => setThumbnailPreview(reader.result);
                                        reader.readAsDataURL(file);
                                    }}
                                    className="hidden"
                                />
                            </label>

                            {!thumbnailPreview && (
                                <div className="mt-3 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-sm">URL:</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="veya görsel adresi yapıştırın..."
                                        className="pl-12 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                        value={!thumbnailFile ? (formData.thumbnail_url || '') : ''}
                                        disabled={!!thumbnailFile}
                                        onChange={(e) => {
                                            const url = e.target.value;
                                            setFormData(prev => ({ ...prev, thumbnail_url: url }));
                                            setThumbnailPreview(url);
                                        }}
                                    />
                                    {thumbnailFile && (
                                        <p className="text-xs text-orange-500 mt-1">
                                            * Dosya seçiliyken işlem yapamazsınız. Önce dosyayı kaldırın.
                                        </p>
                                    )}
                                </div>
                            )}

                            <p className="text-xs text-gray-500 mt-2">Boş bırakılırsa ilk fotoğraf kapak olarak kullanılır.</p>
                        </div>
                    </div>
                </div>

                {/* SEO Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">SEO Ayarları</h2>
                    <div className="space-y-4">
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
                                <p className="text-xs text-gray-500 mt-1">Otomatik olarak galeri başlığından alınır. Sona otomatik olarak " | Site Adı" eklenir.</p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Açıklaması</label>
                            <textarea
                                rows="2"
                                value={formData.seo_description}
                                onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
                                placeholder="Google'da görünecek açıklama"
                            />
                        </div>

                        {/* SEO Preview */}
                        <div className="mt-4">
                            <SeoPreview
                                title={formData.seo_title || formData.title}
                                description={formData.seo_description || formData.title + ' fotoğraf galerisi.'}
                                image={formData.thumbnail_url}
                                url={`/foto-galeri/${formData.title ? slugify(formData.title) : 'galeri'}`}
                                date={new Date().toISOString()}
                            />
                        </div>
                    </div>
                </div>

                {/* Images Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">Fotoğraflar</h2>
                        <div className="flex items-center space-x-2">
                            <button type="button" onClick={addImageRow} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center transition-colors">
                                <Plus size={16} className="mr-1.5" /> Ekle
                            </button>
                            <label className="text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center transition-colors cursor-pointer border border-green-200">
                                <ImageIcon size={16} className="mr-1.5" />
                                <span>Dosyadan Ekle</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    disabled={uploadingImages}
                                />
                            </label>

                            <button type="button" onClick={() => setShowBulkModal(true)} className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg flex items-center transition-colors border border-blue-200">
                                <ImageIcon size={16} className="mr-1.5" />
                                <span>Toplu URL</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {images.map((img, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 relative group transition-all hover:shadow-md">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-100/50 rounded-t-xl">
                                    <div className="flex items-center space-x-2">
                                        <div className="cursor-move text-gray-400 hover:text-gray-600">
                                            <GripVertical size={16} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fotoğraf {index + 1}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImageRow(index)}
                                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                        title="Bu resmi sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Left: Preview & URL */}
                                    <div className="md:col-span-4 space-y-3">
                                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center relative group-hover:border-primary/50 transition-colors">
                                            {img.image_url ? (
                                                <img src={img.image_url} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                            ) : (
                                                <div className="text-center">
                                                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={24} />
                                                    <span className="text-xs text-gray-400">Önizleme</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Görsel URL</label>
                                            {img.image_url && img.image_url.includes('supabase.co') ? (
                                                <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-200 rounded-lg">
                                                    <div className="flex items-center space-x-2 overflow-hidden">
                                                        <div className="p-1.5 bg-green-100 rounded-full text-green-600 flex-shrink-0">
                                                            <ImageIcon size={14} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-bold text-green-700">Görsel Yüklendi</p>
                                                            <p className="text-[10px] text-green-600 truncate opacity-80" title={img.image_url.split('/').pop()}>
                                                                {img.image_url.split('/').pop()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (window.confirm('Bu görseli kaldırmak istediğinize emin misiniz?')) {
                                                                handleImageChange(index, 'image_url', '');
                                                            }
                                                        }}
                                                        className="p-1.5 hover:bg-green-200 rounded-full text-green-600 transition-colors"
                                                        title="Görseli Kaldır"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={img.image_url}
                                                    onChange={(e) => handleImageChange(index, 'image_url', e.target.value)}
                                                    onPaste={(e) => handleUrlPaste(e, index)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono text-gray-600 transition-all"
                                                    placeholder="https://... (Toplu URL yapıştırabilirsiniz)"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Caption */}
                                    <div className="md:col-span-8">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                                            Fotoğraf Açıklaması
                                            <span className="font-normal text-gray-400 ml-2">(İsteğe bağlı)</span>
                                        </label>
                                        <textarea
                                            value={img.caption}
                                            onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                                            className="w-full h-full min-h-[120px] px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed resize-none transition-all"
                                            placeholder="Bu fotoğraf hakkında detaylı bilgi, hikaye veya açıklama yazın..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3 mt-4">
                        {/* Progress Bar */}
                        {uploadingImages && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-blue-700">Fotoğraflar yükleniyor...</span>
                                    <span className="text-sm font-bold text-blue-700">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-blue-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bulk Add Modal */}
                {showBulkModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-900">Toplu Fotoğraf Ekle</h3>
                                <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span style={{ fontSize: '24px' }}>&times;</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Görsel URL'leri (Her satıra bir URL)</label>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    // Request permission first (though readText sometimes handles it)
                                                    try {
                                                        const permission = await navigator.permissions.query({ name: 'clipboard-read' });
                                                        if (permission.state === 'denied') {
                                                            alert('Tarayıcınız pano erişimine izin vermiyor. Lütfen tarayıcı ayarlarından izin verin veya adresi manuel yapıştırın.');
                                                            return;
                                                        }
                                                    } catch (permError) {
                                                        // Fallback for browsers regarding permissions API
                                                        console.log('Permission check skipped:', permError);
                                                    }

                                                    const text = await navigator.clipboard.readText();
                                                    if (text) {
                                                        const cleaned = text.split(/\r?\n/)
                                                            .map(url => url.trim().replace(/^\d+[\.\)\-\s]+\s*/, ''))
                                                            .filter(url => url !== '')
                                                            .join('\n');

                                                        setBulkUrls(prev => {
                                                            const prefix = prev && !prev.endsWith('\n') ? '\n' : '';
                                                            return prev + prefix + cleaned;
                                                        });
                                                    } else {
                                                        alert('Panonuz boş görünüyor. Lütfen önce bir metin kopyaladığınızdan emin olun.');
                                                    }
                                                } catch (err) {
                                                    console.error('Paste error:', err);
                                                    alert('Yapıştırma işlemi başarısız oldu:\n' + (err.message || 'Bilinmeyen hata') + '\n\nLütfen metin alanına sağ tıklayıp "Yapıştır" diyerek veya CTRL+V kısayolunu kullanarak deneyin.');
                                                }
                                            }}
                                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
                                        >
                                            📋 Panodan Yapıştır
                                        </button>
                                    </div>
                                    <textarea
                                        id="bulk-upload-textarea"
                                        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm leading-relaxed"
                                        placeholder={'https://site.com/resim1.jpg\nhttps://site.com/resim2.jpg\n...'}
                                        value={bulkUrls}
                                        onChange={(e) => setBulkUrls(e.target.value)}
                                    // autoFocus removed to prevent focus stealing issues
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Yapıştırdığınız linkleri otomatik olarak parselayıp listeye ekleyeceğiz. "1. Link" gibi numaralandırmalar otomatik temizlenir.</p>
                                </div>
                                <div className="flex space-x-3 pt-2">
                                    <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">İptal</button>
                                    <button type="button" onClick={handleBulkAdd} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Ekle</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Bar */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center space-x-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none shadow-lg"
                    >
                        <Save size={20} />
                        <span className="font-semibold text-lg">{saving ? 'Kaydediliyor...' : 'Galeriyi Kaydet'}</span>
                    </button>
                </div>
            </form >
        </div >
    );
};

export default PhotoGalleryEditPage;
