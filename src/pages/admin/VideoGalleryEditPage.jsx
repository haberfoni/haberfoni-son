import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Video, PlayCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';

const VideoGalleryEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        title: '',
        video_url: '',
        thumbnail_url: '',
        duration: ''
    });

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isEditing) {
            loadVideo();
        }
    }, [id]);

    const loadVideo = async () => {
        try {
            const data = await adminService.getVideo(id);
            setFormData({
                title: data.title,
                video_url: data.video_url,
                thumbnail_url: data.thumbnail_url || '',
                duration: data.duration || ''
            });
        } catch (error) {
            console.error('Error loading video:', error);
            setMessage({ type: 'error', text: 'Video yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = {
                ...formData,
                updated_at: new Date()
            };

            if (isEditing) {
                await adminService.updateVideo(id, payload);
            } else {
                await adminService.createVideo(payload);
            }

            setMessage({ type: 'success', text: 'Video başarıyla kaydedildi.' });
            setTimeout(() => navigate('/admin/video-galleries'), 1000);
        } catch (error) {
            console.error('Error saving video:', error);
            setMessage({ type: 'error', text: 'Hata oluştu. Lütfen tekrar deneyin.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate('/admin/video-galleries')} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
                    <ArrowLeft size={20} className="mr-1" />
                    <span>Listeye Dön</span>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Videoyu Düzenle' : 'Yeni Video Ekle'}</h1>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video Başlığı</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="Örn: Meclis'te hareketli dakikalar..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Video URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Embed/Link)</label>
                            <input
                                type="text"
                                required
                                value={formData.video_url}
                                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm font-mono"
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Süre</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="Örn: 04:20"
                            />
                        </div>
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kapak Görseli URL</label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={formData.thumbnail_url}
                                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm font-mono"
                                placeholder="https://..."
                            />
                            <div className="w-24 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 relative">
                                {formData.thumbnail_url ? (
                                    <>
                                        <img src={formData.thumbnail_url} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <PlayCircle size={16} className="text-white" />
                                        </div>
                                    </>
                                ) : (
                                    <Video size={20} className="text-gray-400" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/video-galleries')}
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
        </div>
    );
};

export default VideoGalleryEditPage;
