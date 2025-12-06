import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Plus, Trash2, GripVertical } from 'lucide-react';
import { adminService } from '../../services/adminService';

const PhotoGalleryEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        thumbnail_url: ''
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

    const handleBulkAdd = () => {
        if (!bulkUrls.trim()) return;

        const urls = bulkUrls.split('\n').filter(url => url.trim() !== '');
        const newImages = urls.map(url => ({ image_url: url.trim(), caption: '' }));

        // Remove the default empty row if it exists and is the only row
        let currentImages = [...images];
        if (currentImages.length === 1 && !currentImages[0].image_url) {
            currentImages = [];
        }

        setImages([...currentImages, ...newImages]);
        setBulkUrls('');
        setShowBulkModal(false);
    };

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
                thumbnail_url: data.thumbnail_url || ''
            });
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

    // Images handling
    const handleImageChange = (index, field, value) => {
        const newImages = [...images];
        newImages[index][field] = value;
        setImages(newImages);
    };

    const addImageRow = () => {
        setImages([...images, { image_url: '', caption: '' }]);
    };

    const removeImageRow = (index) => {
        if (images.length === 1) return; // Prevent deleting last row
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Filter empty images
            const validImages = images.filter(img => img.image_url.trim() !== '');

            const payload = {
                title: formData.title,
                thumbnail_url: formData.thumbnail_url || (validImages.length > 0 ? validImages[0].image_url : null),
                updated_at: new Date() // Not in schema but good practice if allowed, otherwise ignored
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
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="Örn: Haftanın En İyi Doğa Fotoğrafları"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kapak Görseli (Opsiyonel)</label>
                            <input
                                type="text"
                                value={formData.thumbnail_url}
                                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                                placeholder="https://..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa ilk fotoğraf kapak olarak kullanılır.</p>
                        </div>
                    </div>
                </div>

                {/* Images Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">Fotoğraflar</h2>
                        <button type="button" onClick={addImageRow} className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg flex items-center transition-colors">
                            <Plus size={16} className="mr-1" /> Ekle
                        </button>
                    </div>

                    <div className="space-y-4">
                        {images.map((img, index) => (
                            <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 relative group animate-in slide-in-from-left-2 duration-300">

                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-move text-gray-400">
                                    <GripVertical size={20} />
                                </div>

                                <div className="w-full md:w-32 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden border border-gray-300 flex items-center justify-center">
                                    {img.image_url ? (
                                        <img src={img.image_url} alt="" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                    ) : (
                                        <ImageIcon className="text-gray-400" />
                                    )}
                                </div>

                                <div className="flex-grow space-y-3">
                                    <input
                                        type="text"
                                        value={img.image_url}
                                        onChange={(e) => handleImageChange(index, 'image_url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary text-sm font-mono"
                                        placeholder="Görsel URL (https://...)"
                                    />
                                    <input
                                        type="text"
                                        value={img.caption}
                                        onChange={(e) => handleImageChange(index, 'caption', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary text-sm"
                                        placeholder="Resim Açıklaması (Opsiyonel)"
                                    />
                                </div>

                                <div className="flex items-start pt-1">
                                    <button
                                        type="button"
                                        onClick={() => removeImageRow(index)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Bu resmi sil"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="absolute top-2 right-2 md:hidden">
                                    <span className="text-xs font-bold text-gray-300">#{index + 1}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex space-x-3 mt-4">
                        <button type="button" onClick={addImageRow} className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center">
                            <Plus size={20} className="mr-2" />
                            <span>Yeni Fotoğraf Ekle</span>
                        </button>
                        <button type="button" onClick={() => setShowBulkModal(true)} className="flex-1 py-3 border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors flex items-center justify-center">
                            <ImageIcon size={20} className="mr-2" />
                            <span>Toplu URL Yükle</span>
                        </button>
                    </div>
                </div>

                {/* Bulk Add Modal */}
                {showBulkModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="font-bold text-lg text-gray-900">Toplu Fotoğraf Ekle</h3>
                                <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <span size={24}>&times;</span>
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL'leri (Her satıra bir URL)</label>
                                    <textarea
                                        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-xs whitespace-nowrap"
                                        placeholder={'https://ornek.com/foto1.jpg\nhttps://ornek.com/foto2.jpg\n...'}
                                        value={bulkUrls}
                                        onChange={(e) => setBulkUrls(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Yapıştırdığınız linkleri otomatik olarak parselayıp listeye ekleyeceğiz.</p>
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
            </form>
        </div>
    );
};

export default PhotoGalleryEditPage;
