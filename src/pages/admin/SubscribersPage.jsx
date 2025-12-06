import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Send, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/mappers';

const SubscribersPage = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // modal states
    const [showModal, setShowModal] = useState(false);
    const [newsletterData, setNewsletterData] = useState({ subject: '', content: '' });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadSubscribers();
    }, []);

    const loadSubscribers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getSubscribers();
            setSubscribers(data);
        } catch (error) {
            console.error('Error loading subscribers:', error);
            setMessage({ type: 'error', text: 'Aboneler yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu aboneyi silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteSubscriber(id);
            setSubscribers(subscribers.filter(s => s.id !== id));
            setMessage({ type: 'success', text: 'Abone silindi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting subscriber:', error);
            setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
        }
    };

    const handleSendNewsletter = async (e) => {
        e.preventDefault();
        setSending(true);

        // Simulation
        setTimeout(() => {
            setSending(false);
            setShowModal(false);
            setNewsletterData({ subject: '', content: '' });
            setMessage({ type: 'success', text: `${subscribers.length} aboneye bülten başarıyla gönderildi (Simülasyon).` });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }, 1500);
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Mail className="text-primary" />
                        <span>Abone Yönetimi</span>
                    </h1>
                    <p className="text-gray-500">Bülten aboneleri ve e-posta gönderimi.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    disabled={subscribers.length === 0}
                    className="flex items-center space-x-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <Send size={18} />
                    <span>Bülten Gönder</span>
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Toplam Abone: {subscribers.length}</span>
                    <button onClick={loadSubscribers} className="text-sm text-primary hover:underline">Yenile</button>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-gray-100">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Email</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Kayıt Tarihi</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subscribers.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="p-8 text-center text-gray-500">
                                    Henüz hiç abone yok.
                                </td>
                            </tr>
                        ) : (
                            subscribers.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-gray-800 font-medium">{sub.email}</td>
                                    <td className="p-4 text-sm text-gray-500">{formatDate(sub.created_at)}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
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

            {/* Newsletter Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-900">Bülten Oluştur</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSendNewsletter} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Konu Başlığı</label>
                                <input
                                    type="text"
                                    required
                                    value={newsletterData.subject}
                                    onChange={(e) => setNewsletterData({ ...newsletterData, subject: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="Haftalık Haber Bülteni #12"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">İçerik</label>
                                <textarea
                                    required
                                    rows="6"
                                    value={newsletterData.content}
                                    onChange={(e) => setNewsletterData({ ...newsletterData, content: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                                    placeholder="Merhaba, bu haftanın öne çıkan haberleri..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Not: Bu işlem şu anda simülasyon modundadır. Gerçek e-posta gönderilmeyecektir.
                                </p>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Vazgeç</button>
                                <button type="submit" disabled={sending} className="flex-1 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
                                    <Send size={16} />
                                    <span>{sending ? 'Gönderiliyor...' : 'Gönder'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscribersPage;
