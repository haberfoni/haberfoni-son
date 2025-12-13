import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Video, PlayCircle, Image as ImageIcon, X, Link } from 'lucide-react';
import { adminService } from '../../services/adminService';
import RichTextEditor from '../../components/RichTextEditor';
import SeoPreview from '../../components/admin/SeoPreview';

const extractYoutubeId = (url) => {
    const match = url?.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
};

const VideoGalleryEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const generateVideoThumbnail = (file) => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                video.currentTime = 1; // Capture at 1st second
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Calculate Duration
                const duration = video.duration;
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60);
                const durationStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                canvas.toBlob((blob) => {
                    const thumbnailFile = new File([blob], "video-thumbnail.jpg", { type: "image/jpeg" });
                    resolve({ thumbnail: thumbnailFile, duration: durationStr });
                    URL.revokeObjectURL(video.src);
                }, 'image/jpeg', 0.85);
            };
            video.onerror = () => {
                resolve(null);
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const [formData, setFormData] = useState({
        title: '',
        video_url: '',
        thumbnail_url: '',
        duration: '',

        description: '',
        seo_title: '',
        seo_description: '',
        seo_keywords: ''
    });

    // Thumbnail upload state
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

    // Video upload state
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);

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
                duration: data.duration || '',
                description: data.description || '',
                seo_title: data.seo_title || data.title || '',
                seo_description: data.seo_description || (data.description ? data.description.replace(/<[^>]*>?/gm, '').slice(0, 200) : '') || '',
                seo_keywords: data.seo_keywords || ''
            });
            // Set preview if thumbnail exists
            if (data.thumbnail_url) {
                setThumbnailPreview(data.thumbnail_url);
            }
        } catch (error) {
            console.error('Error loading video:', error);
            setMessage({ type: 'error', text: 'Video yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    // Thumbnail handling
    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file size (1MB)
        if (file.size > 1024 * 1024) {
            setMessage({ type: 'error', text: 'Dosya boyutu 1MB\'dan büyük olamaz.' });
            return;
        }

        // Validate file type
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
            setMessage({ type: 'error', text: 'Sadece JPEG, PNG ve WebP formatları desteklenmektedir.' });
            return;
        }

        setThumbnailFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setThumbnailPreview(reader.result);
        };
        reader.readAsDataURL(file);
        setMessage({ type: '', text: '' });
    };

    const removeThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview('');
        setFormData({ ...formData, thumbnail_url: '' });
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingVideo(true);
        setVideoUploadProgress(0);
        setMessage({ type: '', text: '' });

        try {
            const url = await adminService.uploadVideo(file, (progress) => {
                setVideoUploadProgress(progress);
            });

            // Update form data with the new URL
            setFormData(prev => ({
                ...prev,
                video_url: url,
                // If title is empty, use filename
                title: prev.title || file.name.replace(/\.[^/.]+$/, "")
            }));

            // AUTO-GENERATE THUMBNAIL & DURATION
            try {
                const result = await generateVideoThumbnail(file);
                if (result) {
                    const { thumbnail, duration } = result;

                    // Set Thumbnail
                    if (thumbnail) {
                        setThumbnailFile(thumbnail);
                        const reader = new FileReader();
                        reader.onloadend = () => setThumbnailPreview(reader.result);
                        reader.readAsDataURL(thumbnail);
                    }

                    // Set Duration
                    if (duration) {
                        setFormData(prev => ({ ...prev, duration: duration }));
                    }
                }
            } catch (thumbError) {
                console.error("Thumbnail/Duration generation failed:", thumbError);
            }

            setMessage({ type: 'success', text: 'Video başarıyla yüklendi, kapak ve süre oluşturuldu.' });
        } catch (error) {
            console.error('Video upload error:', error);
            setMessage({ type: 'error', text: error.message });
        } finally {
            setUploadingVideo(false);
            setVideoUploadProgress(0);
            e.target.value = ''; // Reset input
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
                setUploadingThumbnail(true);
                try {
                    thumbnailUrl = await adminService.uploadGalleryThumbnail(thumbnailFile);

                    // Delete old thumbnail if updating
                    if (isEditing && formData.thumbnail_url) {
                        await adminService.deleteGalleryThumbnail(formData.thumbnail_url);
                    }
                } catch (uploadError) {
                    setMessage({ type: 'error', text: uploadError.message });
                    setSaving(false);
                    setUploadingThumbnail(false);
                    return;
                } finally {
                    setUploadingThumbnail(false);
                }
            }

            const payload = {
                title: formData.title,
                video_url: formData.video_url,
                thumbnail_url: thumbnailUrl || null,
                duration: formData.duration || null,
                description: formData.description || null,
                seo_title: formData.seo_title || null,
                seo_description: formData.seo_description || null,
                seo_keywords: formData.seo_keywords || null,
                // Add views for new records if not present
                ...(!isEditing && { views: 0 })
            };

            console.log('Saving video payload:', payload); // Debug log

            if (isEditing) {
                await adminService.updateVideo(id, payload);
            } else {
                await adminService.createVideo(payload);
            }

            setMessage({ type: 'success', text: 'Video başarıyla kaydedildi.' });
            setTimeout(() => navigate('/admin/video-galleries'), 1000);
        } catch (error) {
            console.error('Error saving video:', error);
            setMessage({ type: 'error', text: `Hata: ${error.message || 'Bir sorun oluştu.'}` });
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
                            onChange={(e) => {
                                const val = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    title: val,
                                    seo_title: (!prev.seo_title || prev.seo_title === prev.title) ? val : prev.seo_title
                                }));
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video Açıklaması</label>
                        <RichTextEditor
                            value={formData.description || ''}
                            onChange={(content) => {
                                const stripped = content.replace(/<[^>]*>?/gm, '').slice(0, 200);
                                setFormData(prev => ({
                                    ...prev,
                                    description: content,
                                    // Auto-update SEO desc if it matches old stripped description
                                    seo_description: (!prev.seo_description || prev.seo_description === prev.description?.replace(/<[^>]*>?/gm, '').slice(0, 200)) ? stripped : prev.seo_description
                                }));
                            }}
                            placeholder="Video içeriği hakkında bilgi..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Video URL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Video Kaynağı</label>

                            {formData.video_url && formData.video_url.includes('supabase.co') ? (
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center space-x-3 overflow-hidden">
                                        <div className="p-2 bg-green-100 rounded-full text-green-600 flex-shrink-0">
                                            <Video size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-green-800">Video Yüklendi</p>
                                            <p className="text-xs text-green-600 truncate" title={formData.video_url.split('/').pop()}>
                                                {formData.video_url.split('/').pop()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm('Videoyu kaldırmak istediğinize emin misiniz?')) {
                                                setFormData(prev => ({ ...prev, video_url: '' }));
                                            }
                                        }}
                                        className="p-2 hover:bg-green-200 rounded-full text-green-600 transition-colors ml-2"
                                        title="Videoyu Kaldır"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Video className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            required={!formData.video_url}
                                            value={formData.video_url}
                                            onChange={(e) => {
                                                const url = e.target.value;
                                                const videoId = extractYoutubeId(url);
                                                let newThumbnailUrl = formData.thumbnail_url;

                                                // Auto-fetch thumbnail if empty and no file selected
                                                if (videoId && !formData.thumbnail_url && !thumbnailFile) {
                                                    newThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                                                    setThumbnailPreview(newThumbnailUrl);
                                                }

                                                setFormData(prev => ({
                                                    ...prev,
                                                    video_url: url,
                                                    thumbnail_url: newThumbnailUrl
                                                }));
                                            }}
                                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm font-mono"
                                            placeholder="YouTube linki veya yükleme..."
                                        />
                                    </div>

                                    {/* Video Upload Button */}
                                    <div className="mt-3">
                                        <label className={`group flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all ${uploadingVideo ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {uploadingVideo ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                                                        <p className="text-xs text-gray-500">Yükleniyor... {videoUploadProgress}%</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Video className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-1" />
                                                        <p className="text-xs text-gray-500 group-hover:text-blue-600">Bilgisayardan Video Yükle</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">MP4, WebM (Max 50MB)</p>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                                                onChange={handleVideoUpload}
                                                className="hidden"
                                                disabled={uploadingVideo}
                                            />
                                        </label>
                                        {uploadingVideo && (
                                            <div className="w-full bg-gray-200 rounded-full h-1 mt-2 overflow-hidden">
                                                <div
                                                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                                    style={{ width: `${videoUploadProgress}%` }}
                                                ></div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Süre</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="Örn: 05:30 (YouTube için manuel giriniz)"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Dosya yüklenirse otomatik dolar. YouTube videoları için elle giriniz.
                            </p>
                        </div>
                    </div>
                    {/* SEO Settings */}
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
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Anahtar Kelimeler</label>
                                <input
                                    type="text"
                                    value={formData.seo_keywords}
                                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm"
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
                            />
                        </div>

                        {/* SEO Preview */}
                        <div className="mt-4">
                            <SeoPreview
                                title={formData.seo_title || formData.title}
                                description={formData.seo_description || formData.description?.replace(/<[^>]*>?/gm, '').slice(0, 160)}
                                image={formData.thumbnail_url}
                                url={`/video-galeri/${formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'video'}`}
                                date={new Date().toISOString()}
                            />
                        </div>
                    </div>

                    {/* Thumbnail Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kapak Görseli</label>
                        {thumbnailPreview && (
                            <div className="mb-3 relative inline-block">
                                <img
                                    src={thumbnailPreview}
                                    alt="Kapak önizleme"
                                    className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
                                    onError={(e) => {
                                        if (e.target.src.includes('maxresdefault')) {
                                            e.target.src = e.target.src.replace('maxresdefault', 'hqdefault');
                                        } else {
                                            e.target.style.display = 'none';
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={removeThumbnail}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    title="Kaldır"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* File Input */}
                        <div className="flex flex-col gap-3">
                            <label className="flex-1 cursor-pointer block relative">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary hover:bg-gray-50 transition-colors text-center">
                                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-sm text-gray-600">
                                        {thumbnailFile ? thumbnailFile.name : 'Dosya seçin veya sürükleyin'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Max 1MB - JPEG, PNG, WebP</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />
                            </label>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Link className="text-gray-400" size={16} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="veya görsel adresi yapıştırın..."
                                    className={`pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary text-sm ${thumbnailFile ? 'bg-gray-100 text-gray-400' : ''}`}
                                    value={!thumbnailFile ? (formData.thumbnail_url || '') : ''}
                                    disabled={!!thumbnailFile}
                                    onChange={(e) => {
                                        const url = e.target.value;
                                        // If user pastes a YouTube VIDEO URL into the IMAGE URL field, convert it smart
                                        const videoId = extractYoutubeId(url);
                                        const finalUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : url;

                                        setFormData(prev => ({ ...prev, thumbnail_url: finalUrl }));
                                        setThumbnailPreview(finalUrl);
                                    }}
                                />
                                {thumbnailFile && (
                                    <p className="text-xs text-orange-500 mt-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full inline-block"></span>
                                        Görsel dosya seçildiği için URL girişi devre dışı.
                                    </p>
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
            </form >
        </div >
    );
};

export default VideoGalleryEditPage;
