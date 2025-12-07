import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Edit2, Trash2, Plus, Eye, PlayCircle, Copy, Trash, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/mappers';

const VideoGalleryListPage = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    const [filters, setFilters] = useState({
        search: '',
        status: 'all'
    });

    const [sortConfig, setSortConfig] = useState({
        key: 'created_at',
        direction: 'desc'
    });

    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        loadVideos();
    }, [page, filters, sortConfig]);

    // Reset selection when content changes
    useEffect(() => {
        setSelectedIds([]);
    }, [videos]);

    const loadVideos = async () => {
        try {
            setLoading(true);
            const { data, count } = await adminService.getVideos(page, pageSize, filters);

            // Sort data on frontend (since Supabase ordering with range can be tricky if not indexed, or just to be safe with mixed pagination)
            // Note: Optimally we trust the backend sort, but here we can refine if needed.
            // Actually reusing the backend sort is better, but since getVideos has default sort, we update it if we implement server-side sorting fully.
            // For now, let's stick to the server response as the service has 'order'
            setVideos(data || []);
            setTotal(count || 0);
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
            loadVideos(); // Reload to update list and counts
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Silme işlemi başarısız.');
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === videos.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(videos.map(v => v.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleStatus = async (item) => {
        try {
            const newStatus = !item.published_at;
            await adminService.toggleVideoStatus(item.id, newStatus);

            setVideos(prev => prev.map(v =>
                v.id === item.id
                    ? { ...v, published_at: newStatus ? new Date().toISOString() : null }
                    : v
            ));
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Durum güncellenemedi: ' + error.message);
        }
    };

    const handleBulkDuplicate = async () => {
        if (!window.confirm(`${selectedIds.length} videoyu çoğaltmak istediğinize emin misiniz?`)) return;
        try {
            await adminService.duplicateVideosBulk(selectedIds);
            loadVideos();
            setSelectedIds([]);
            alert('Seçilen videolar başarıyla çoğaltıldı.');
        } catch (error) {
            console.error('Bulk duplicate failed:', error);
            alert('Toplu çoğaltma başarısız: ' + (error.message || error));
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`${selectedIds.length} videoyu silmek istediğinize emin misiniz?`)) return;
        try {
            await adminService.deleteVideosBulk(selectedIds);
            loadVideos();
            setSelectedIds([]);
            alert('Seçilen videolar silindi.');
        } catch (error) {
            console.error('Bulk delete failed:', error);
            alert('Silme işlemi başarısız: ' + (error.message || error));
        }
    };

    const handleSort = (key) => {
        // Currently only purely visual for user or requires modifying backend service query
        // For simplicity, we just toggle UI state, but ideally we pass this to loadVideos
        // Since backend service has fixed sort, we might need to update service if we want dynamic sort.
        // Given existing code, we stick to default DESC created_at or update if needed.
        console.log('Sorting by', key, 'not fully implemented on backend yet, preserving default order.');
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <Video className="text-primary" />
                    <span>Video Galeri Yönetimi</span>
                </h1>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Başlık ara..."
                        className="px-3 py-2 border rounded-lg text-sm min-w-[200px]"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 0 }))}
                    />

                    {/* Status Filter */}
                    <select
                        className="px-3 py-2 border rounded-lg text-sm bg-white"
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 0 }))}
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="published">Aktif</option>
                        <option value="draft">Pasif</option>
                    </select>

                    <button
                        type="button"
                        onClick={loadVideos}
                        className="p-2 border rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        title="Yenile"
                    >
                        <RefreshCw size={18} />
                    </button>

                    <Link to="/admin/video-galleries/new" className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors whitespace-nowrap">
                        <Plus size={18} />
                        <span className="hidden sm:inline">Yeni Video</span>
                    </Link>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="text-blue-800 font-medium text-sm flex items-center gap-2">
                        <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">{selectedIds.length}</span>
                        video seçildi
                    </span>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={handleBulkDuplicate}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
                        >
                            <Copy size={16} />
                            Seçilenleri Çoğalt
                        </button>
                        <button
                            type="button"
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                        >
                            <Trash size={16} />
                            Seçilenleri Sil
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={videos.length > 0 && selectedIds.length === videos.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Görsel</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Başlık</th>
                                <th className="p-4 text-center font-semibold text-gray-600 text-sm">Durum</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Kaynak / Süre</th>
                                <th className="p-4 text-center font-semibold text-gray-600 text-sm">Görüntülenme</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Tarih</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Yükleniyor...</td></tr>
                            ) : videos.length === 0 ? (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">Video bulunamadı.</td></tr>
                            ) : (
                                videos.map(item => (
                                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/50' : ''}`}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-4 w-24">
                                            <div className="w-20 h-14 bg-gray-100 rounded overflow-hidden relative">
                                                <img src={item.thumbnail_url || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <PlayCircle className="text-white" size={20} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 line-clamp-2 max-w-xs">{item.title}</td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleStatus(item); }}
                                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${item.published_at
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {item.published_at ? 'Yayında' : 'Taslak'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            <div>
                                                {item.video_url?.toLowerCase().includes('youtube') || item.video_url?.toLowerCase().includes('youtu.be')
                                                    ? 'YouTube'
                                                    : item.video_url?.includes('supabase.co')
                                                        ? 'Dosya Yükleme'
                                                        : 'Diğer'}
                                            </div>
                                            <div className="text-xs text-gray-400">{item.duration}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className={`font-semibold ${item.views >= 1000 ? 'text-orange-600' : 'text-gray-600'}`}>
                                                    {(item.views || 0).toLocaleString('tr-TR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center p-4 border-t border-gray-100 space-x-2">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Önceki
                        </button>
                        <span className="px-3 py-1 text-gray-600">Sayfa {page + 1} / {totalPages}</span>
                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sonraki
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGalleryListPage;
