import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Image, Edit2, Trash2, Plus, Eye } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/mappers';

const PhotoGalleryListPage = () => {
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGalleries();
    }, []);

    const loadGalleries = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPhotoGalleries();
            setGalleries(data);
        } catch (error) {
            console.error('Error loading galleries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu galeriyi ve içindeki tüm fotoğrafları silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deletePhotoGallery(id);
            setGalleries(galleries.filter(g => g.id !== id));
        } catch (error) {
            console.error('Error deleting gallery:', error);
            alert('Silme işlemi başarısız.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <Image className="text-primary" />
                    <span>Foto Galeri Yönetimi</span>
                </h1>
                <Link to="/admin/photo-galleries/new" className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                    <Plus size={18} />
                    <span>Yeni Galeri</span>
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Görsel</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Başlık</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Tarih</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Yükleniyor...</td></tr>
                        ) : galleries.length === 0 ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-500">Galeri bulunamadı.</td></tr>
                        ) : (
                            galleries.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 w-24">
                                        <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                                            <img src={item.thumbnail_url || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{item.title}</td>
                                    <td className="p-4 text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <Link to={`/foto-galeri/${item.id}`} target="_blank" className="inline-block p-2 text-gray-400 hover:text-primary transition-colors" title="Görüntüle">
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/admin/photo-galleries/edit/${item.id}`} className="inline-block p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
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

export default PhotoGalleryListPage;
