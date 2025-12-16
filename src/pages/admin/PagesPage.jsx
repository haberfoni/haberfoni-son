import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Plus, Search, Edit2, Trash2, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PagesPage = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPages();
            setPages(data);
        } catch (error) {
            console.error('Error loading pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu sayfayı silmek istediğinizden emin misiniz?')) {
            try {
                await adminService.deletePage(id);
                setPages(pages.filter(page => page.id !== id));
            } catch (error) {
                console.error('Error deleting page:', error);
                alert('Silme işlemi sırasında bir hata oluştu.');
            }
        }
    };

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sayfalar</h1>
                    <p className="text-gray-500">Kurumsal sayfaları yönetin (Hakkımızda, Künye vb.)</p>
                </div>
                <Link
                    to="/admin/pages/new"
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus size={20} />
                    <span>Yeni Sayfa Ekle</span>
                </Link>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Sayfa ara..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 font-semibold text-gray-600">Başlık</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">URL (Slug)</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Durum</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPages.length > 0 ? (
                                filteredPages.map(page => (
                                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                    <FileText size={20} />
                                                </div>
                                                <span className="font-medium text-gray-900">{page.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">/{page.slug}</td>
                                        <td className="px-6 py-4">
                                            {page.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle size={12} className="mr-1" />
                                                    Yayında
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    <XCircle size={12} className="mr-1" />
                                                    Taslak
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <a
                                                    href={
                                                        page.slug === 'reklam' ? '/reklam' :
                                                            page.slug === 'iletisim' ? '/iletisim' :
                                                                page.slug === 'hakkimizda' ? '/hakkimizda' :
                                                                    `/kurumsal/${page.slug}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Görüntüle"
                                                >
                                                    <Eye size={18} />
                                                </a>
                                                <button
                                                    onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(page.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        Sayfa bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PagesPage;
