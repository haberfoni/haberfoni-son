import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Edit2, Trash2, Plus, Eye, Copy, Trash, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/mappers';
import { slugify } from '../../utils/slugify';

const NewsListPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    const [filters, setFilters] = useState({
        search: '',
        category: 'all',
        status: 'all'
    });

    const [sortConfig, setSortConfig] = useState({
        key: 'created_at', // Default sort by date
        direction: 'desc' // desc = newest first
    });

    const [selectedIds, setSelectedIds] = useState([]);

    // Categories for filter
    const categories = ['gundem', 'siyaset', 'ekonomi', 'dunya', 'spor', 'magazin', 'teknoloji', 'saglik'];

    useEffect(() => {
        loadNews();
    }, [page, filters, sortConfig]);

    // Reset selection when content changes
    useEffect(() => {
        setSelectedIds([]);
    }, [news]);

    const loadNews = async () => {
        try {
            setLoading(true);
            const { data, count } = await adminService.getNewsList(page, pageSize, filters);

            // Sort data on frontend
            const sortedData = [...data].sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (sortConfig.direction === 'asc') {
                    return aVal > bVal ? 1 : -1;
                } else {
                    return aVal < bVal ? 1 : -1;
                }
            });

            setNews(sortedData);
            setTotal(count);
        } catch (error) {
            console.error('Error loading news:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === news.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(news.map(n => n.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDuplicate = async (id) => {
        console.log('Duplicate clicked for id:', id);
        if (!window.confirm('Bu haberi kopyalamak istediğinize emin misiniz?')) return;
        try {
            await adminService.duplicateNews(id);
            loadNews();
            alert('Haber kopyalandı.');
        } catch (error) {
            console.error('Duplicate failed:', error);
            alert('Kopyalama başarısız: ' + (error.message || error));
        }
    };

    const handleBulkDuplicate = async () => {
        console.log('Bulk duplicate clicked');
        if (!window.confirm(`${selectedIds.length} haberi çoğaltmak istediğinize emin misiniz?`)) return;
        try {
            await adminService.duplicateNewsBulk(selectedIds);
            loadNews();
            setSelectedIds([]);
            alert('Seçilen haberler çoğaltıldı.');
        } catch (error) {
            console.error('Bulk duplicate failed:', error);
            alert('Toplu çoğaltma başarısız: ' + (error.message || error));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu haberi silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteNews(id);
            setNews(news.filter(n => n.id !== id));
            setTotal(total - 1);
        } catch (error) {
            console.error('Error deleting news:', error);
            alert('Silme işlemi başarısız.');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`${selectedIds.length} haberi silmek istediğinize emin misiniz?`)) return;
        try {
            await adminService.deleteNewsBulk(selectedIds);
            loadNews();
            setSelectedIds([]);
            alert('Seçilen haberler silindi.');
        } catch (error) {
            console.error('Bulk delete failed:', error);
            alert('Toplu silme başarısız.');
        }
    };

    const totalPages = Math.ceil(total / pageSize);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <span className="text-gray-400 ml-1">⇅</span>;
        }
        return sortConfig.direction === 'desc'
            ? <span className="text-primary ml-1">↓</span>
            : <span className="text-primary ml-1">↑</span>;
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <FileText className="text-primary" />
                    <span>Haber Yönetimi</span>
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

                    {/* Category Filter */}
                    <select
                        className="px-3 py-2 border rounded-lg text-sm bg-white"
                        value={filters.category}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 0 }))}
                    >
                        <option value="all">Tüm Kategoriler</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat} className="capitalize">{cat}</option>
                        ))}
                    </select>

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
                        onClick={loadNews}
                        className="p-2 border rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                        title="Yenile"
                    >
                        <RefreshCw size={18} />
                    </button>

                    <Link to="/admin/news/new" className="bg-black text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors whitespace-nowrap">
                        <Plus size={18} />
                        <span className="hidden sm:inline">Yeni Haber</span>
                    </Link>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <span className="text-blue-800 font-medium text-sm flex items-center gap-2">
                        <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">{selectedIds.length}</span>
                        haber seçildi
                    </span>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleBulkDuplicate(); }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
                        >
                            <Copy size={16} />
                            Seçilenleri Çoğalt
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleBulkDelete(); }}
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
                                        checked={news.length > 0 && selectedIds.length === news.length}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                    />
                                </th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Görsel</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Başlık</th>
                                <th className="p-4">
                                    <button
                                        onClick={() => handleSort('category')}
                                        className="font-semibold text-gray-600 text-sm hover:text-primary transition-colors flex items-center"
                                    >
                                        Kategori
                                        <SortIcon columnKey="category" />
                                    </button>
                                </th>
                                <th className="p-4">
                                    <button
                                        onClick={() => handleSort('created_at')}
                                        className="font-semibold text-gray-600 text-sm hover:text-primary transition-colors flex items-center"
                                    >
                                        Tarih
                                        <SortIcon columnKey="created_at" />
                                    </button>
                                </th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Durum</th>
                                <th className="p-4">
                                    <button
                                        onClick={() => handleSort('views')}
                                        className="font-semibold text-gray-600 text-sm hover:text-primary transition-colors flex items-center mx-auto"
                                    >
                                        Görüntülenme
                                        <SortIcon columnKey="views" />
                                    </button>
                                </th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">Yükleniyor...</td>
                                </tr>
                            ) : news.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">Haber bulunamadı.</td>
                                </tr>
                            ) : (
                                news.map(item => (
                                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(item.id) ? 'bg-blue-50/50' : ''}`}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item.id)}
                                                onChange={() => toggleSelect(item.id)}
                                                className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <FileText size={16} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-gray-900 max-w-xs truncate" title={item.title}>{item.title}</td>
                                        <td className="p-4 capitalize text-sm text-gray-600">{item.category}</td>
                                        <td className="p-4 text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                        <td className="p-4">
                                            <button
                                                type="button"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const isPublished = !!item.published_at;
                                                        const newPublishedAt = isPublished ? null : new Date().toISOString();

                                                        // Update DB
                                                        await adminService.updateNews(item.id, { published_at: newPublishedAt });

                                                        // Update Local State
                                                        setNews(news.map(n => n.id === item.id ? { ...n, published_at: newPublishedAt } : n));
                                                    } catch (error) {
                                                        console.error('Update failed:', error);
                                                        alert('Güncelleme başarısız');
                                                    }
                                                }}
                                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${item.published_at ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {item.published_at ? 'Aktif' : 'Pasif'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {item.views >= 1000 && <span title="Çok popüler!">🔥</span>}
                                                {item.views >= 500 && item.views < 1000 && <span title="Popüler">⭐</span>}
                                                <span className={`font-semibold ${item.views >= 1000 ? 'text-orange-600' : item.views >= 500 ? 'text-blue-600' : 'text-gray-600'}`}>
                                                    {(item.views || 0).toLocaleString('tr-TR')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleDuplicate(item.id); }}
                                                className="inline-block p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Şablonu Kopyala"
                                            >
                                                <span className="text-xs font-bold">Tekrarla</span>
                                            </button>
                                            <Link to={`/kategori/${item.category}/${item.slug || slugify(item.title)}`} target="_blank" className="inline-block p-2 text-gray-400 hover:text-primary transition-colors" title="Görüntüle">
                                                <Eye size={18} />
                                            </Link>
                                            <Link to={`/admin/news/edit/${item.id}`} className="inline-block p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Düzenle">
                                                <Edit2 size={18} />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Sil"
                                            >
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

export default NewsListPage;
