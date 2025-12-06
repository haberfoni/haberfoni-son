import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Edit2, Trash2, Plus, Eye, PlayCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/mappers';

const VideoGalleryListPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        try {
            setLoading(true);
            const data = await adminService.getVideos();
            setVideos(data);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu videoyu silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteVideo(id);
            setVideos(videos.filter(v => v.id !== id));
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Silme işlemi başarısız.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <Video className="text-primary" />
                    <span>Video Galeri Yönetimi</span>
                </h1>
                <Link to="/admin/video-galleries/new" className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                    <Plus size={18} />
                    <span>Yeni Video</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Görsel</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Başlık</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Kaynak / Süre</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Yükleniyor...</td></tr>
                        ) : videos.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Video bulunamadı.</td></tr>
                        ) : (
                            videos.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 w-24">
                                        <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden relative">
                                            <img src={item.thumbnail_url || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <PlayCircle className="text-white" size={20} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900 line-clamp-2 max-w-xs">{item.title}</td>
                                    <td className="p-4 text-sm text-gray-500">
                                        <div>{item.video_url?.includes('youtube') ? 'YouTube' : 'Diğer'}</div>
                                        <div className="text-xs text-gray-400">{item.duration}</div>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <Link to={`/video-galeri/${item.id}`} target="_blank" className="inline-block p-2 text-gray-400 hover:text-primary transition-colors" title="Görüntüle">
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/admin/video-galleries/edit/${item.id}`} className="inline-block p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                                            <Edit2 size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VideoGalleryListPage;
