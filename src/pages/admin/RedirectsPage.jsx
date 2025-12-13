import React, { useState, useEffect } from 'react';
import { Shuffle, Plus, Trash2, ArrowRight } from 'lucide-react';
import { adminService } from '../../services/adminService';

const RedirectsPage = () => {
    const [redirects, setRedirects] = useState([]);
    const [newRedirect, setNewRedirect] = useState({ old_path: '', new_path: '' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadRedirects();
    }, []);

    const loadRedirects = async () => {
        try {
            setLoading(true);
            const data = await adminService.getRedirects();
            setRedirects(data);
        } catch (error) {
            console.error('Error loading redirects:', error);
            setMessage({ type: 'error', text: 'Yönlendirmeler yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddRedirect = async (e) => {
        e.preventDefault();
        if (!newRedirect.old_path.trim() || !newRedirect.new_path.trim()) return;

        // Ensure paths start with /
        let oldPath = newRedirect.old_path.trim();
        if (!oldPath.startsWith('/')) oldPath = '/' + oldPath;

        let newPath = newRedirect.new_path.trim();
        if (!newPath.startsWith('http') && !newPath.startsWith('/')) newPath = '/' + newPath;

        try {
            const added = await adminService.addRedirect({
                old_path: oldPath,
                new_path: newPath,
                status_code: 301
            });
            setRedirects([added, ...redirects]);
            setNewRedirect({ old_path: '', new_path: '' });
            setMessage({ type: 'success', text: 'Yönlendirme eklendi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error adding redirect:', error);
            setMessage({ type: 'error', text: 'Eklenerken hata oluştu. Eski yol benzersiz olmalıdır.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu yönlendirmeyi silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteRedirect(id);
            setRedirects(redirects.filter(r => r.id !== id));
            setMessage({ type: 'success', text: 'Yönlendirme silindi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting redirect:', error);
            setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Shuffle className="text-primary" />
                <span>301 Yönlendirmeler</span>
            </h1>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="font-semibold text-gray-700 mb-4">Yeni Yönlendirme Ekle</h2>
                <form onSubmit={handleAddRedirect} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Eski Yol (Örn: /kategori/gundem/eski-baslik.html)</label>
                        <input
                            type="text"
                            value={newRedirect.old_path}
                            onChange={(e) => setNewRedirect({ ...newRedirect, old_path: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                            placeholder="/kategori/gundem/eski-baslik.html"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Yeni Yol (Örn: /kategori/gundem/yeni-baslik)</label>
                        <input
                            type="text"
                            value={newRedirect.new_path}
                            onChange={(e) => setNewRedirect({ ...newRedirect, new_path: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                            placeholder="/kategori/gundem/yeni-baslik"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 whitespace-nowrap"
                        disabled={!newRedirect.old_path || !newRedirect.new_path}
                    >
                        <Plus size={18} />
                        <span>Ekle</span>
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Kaynak</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Hedef</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm w-20">Durum</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm w-20 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {redirects.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                    Henüz yönlendirme eklenmemiş.
                                </td>
                            </tr>
                        ) : (
                            redirects.map(redirect => (
                                <tr key={redirect.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-mono text-sm text-red-600">{redirect.old_path}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <ArrowRight size={16} className="text-gray-400" />
                                            <span className="font-mono text-sm text-green-600">{redirect.new_path}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-600">
                                            {redirect.status_code || 301}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(redirect.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
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
        </div>
    );
};

export default RedirectsPage;
