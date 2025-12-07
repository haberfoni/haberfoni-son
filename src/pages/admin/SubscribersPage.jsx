import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Send, X, Plus, Calendar, Users, Loader } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/mappers';
import { supabase } from '../../services/supabase';
import NewsletterComposer from '../../components/admin/NewsletterComposer';
import { sendNewsletterToSubscribers } from '../../services/emailService';

const SubscribersPage = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [newsletters, setNewsletters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showComposer, setShowComposer] = useState(false);
    const [sendingNewsletter, setSendingNewsletter] = useState(null);
    const [sendProgress, setSendProgress] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            await Promise.all([loadSubscribers(), loadNewsletters()]);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSubscribers = async () => {
        try {
            const data = await adminService.getSubscribers();
            setSubscribers(data);
        } catch (error) {
            console.error('Error loading subscribers:', error);
            setMessage({ type: 'error', text: 'Aboneler yüklenirken hata oluştu.' });
        }
    };

    const loadNewsletters = async () => {
        try {
            const { data, error } = await supabase
                .from('newsletters')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNewsletters(data || []);
        } catch (error) {
            console.error('Error loading newsletters:', error);
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

    const handleSaveNewsletter = async (newsletterData) => {
        try {
            const { data, error } = await supabase
                .from('newsletters')
                .insert([{
                    subject: newsletterData.subject,
                    content: newsletterData.content,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                }])
                .select()
                .single();

            if (error) throw error;

            setNewsletters([data, ...newsletters]);
            setMessage({
                type: 'success',
                text: 'Bülten kaydedildi! Email entegrasyonu eklendiğinde gönderilebilecek.'
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Error saving newsletter:', error);
            throw error;
        }
    };

    const handleSendNewsletter = async (newsletter) => {
        if (subscribers.length === 0) {
            setMessage({ type: 'error', text: 'Abone listesi boş. Lütfen önce abone ekleyin.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }

        if (!window.confirm(`Bu bülteni ${subscribers.length} aboneye göndermek istediğinize emin misiniz?`)) {
            return;
        }

        setSendingNewsletter(newsletter.id);
        setSendProgress({ current: 0, total: subscribers.length, successCount: 0, failCount: 0 });

        try {
            const result = await sendNewsletterToSubscribers(
                subscribers,
                { subject: newsletter.subject, content: newsletter.content },
                (progress) => {
                    setSendProgress(progress);
                }
            );

            // Update newsletter in database
            const { error } = await supabase
                .from('newsletters')
                .update({
                    sent_at: new Date().toISOString(),
                    sent_count: result.successCount
                })
                .eq('id', newsletter.id);

            if (error) throw error;

            // Reload newsletters
            await loadNewsletters();

            setMessage({
                type: 'success',
                text: `Bülten gönderildi! Başarılı: ${result.successCount}, Başarısız: ${result.failCount}`
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        } catch (error) {
            console.error('Error sending newsletter:', error);
            setMessage({
                type: 'error',
                text: 'Bülten gönderilirken hata oluştu: ' + error.message
            });
        } finally {
            setSendingNewsletter(null);
            setSendProgress(null);
        }
    };

    const handleDeleteNewsletter = async (id) => {
        if (!window.confirm('Bu bülteni silmek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase
                .from('newsletters')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setNewsletters(newsletters.filter(n => n.id !== id));
            setMessage({ type: 'success', text: 'Bülten silindi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting newsletter:', error);
            setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Mail className="text-primary" />
                        <span>Abone Yönetimi</span>
                    </h1>
                    <p className="text-gray-500">Bülten aboneleri ve bülten yönetimi.</p>
                </div>
                <button
                    onClick={() => setShowComposer(true)}
                    className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    <Plus size={18} />
                    <span>Yeni Bülten Oluştur</span>
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Subscribers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <Users size={18} />
                        Toplam Abone: {subscribers.length}
                    </span>
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

            {/* Newsletters List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <Send size={18} />
                        Oluşturulan Bültenler ({newsletters.length})
                    </span>
                </div>
                <div className="divide-y divide-gray-100">
                    {newsletters.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Henüz bülten oluşturulmamış.
                        </div>
                    ) : (
                        newsletters.map(newsletter => (
                            <div key={newsletter.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 mb-1">{newsletter.subject}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{newsletter.content}</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {formatDate(newsletter.created_at)}
                                            </span>
                                            {newsletter.sent_at && (
                                                <span className="text-green-600 font-medium">
                                                    ✓ {newsletter.sent_count} kişiye gönderildi
                                                </span>
                                            )}
                                            {!newsletter.sent_at && (
                                                <span className="text-orange-600 font-medium">
                                                    Taslak (Henüz gönderilmedi)
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {!newsletter.sent_at && (
                                            <button
                                                onClick={() => handleSendNewsletter(newsletter)}
                                                disabled={sendingNewsletter === newsletter.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Abonelere Gönder"
                                            >
                                                {sendingNewsletter === newsletter.id ? (
                                                    <Loader size={16} className="animate-spin" />
                                                ) : (
                                                    <Send size={16} />
                                                )}
                                                <span className="text-sm">Gönder</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteNewsletter(newsletter.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Sil"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Newsletter Composer Modal */}
            <NewsletterComposer
                isOpen={showComposer}
                onClose={() => setShowComposer(false)}
                onSave={handleSaveNewsletter}
                onSaveAndSend={async (newsletterData) => {
                    // First save the newsletter
                    await handleSaveNewsletter(newsletterData);
                    // Then get the latest newsletter and send it
                    const { data } = await supabase
                        .from('newsletters')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    if (data) {
                        await handleSendNewsletter(data);
                    }
                }}
            />

            {/* Send Progress Modal */}
            {sendProgress && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Bülten Gönderiliyor...</h3>
                        <div className="space-y-4">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-primary h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${(sendProgress.current / sendProgress.total) * 100}%` }}
                                ></div>
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-gray-700">
                                    {sendProgress.current} / {sendProgress.total} abone
                                </p>
                                <div className="flex justify-center gap-4 text-sm">
                                    <span className="text-green-600">✓ Başarılı: {sendProgress.successCount}</span>
                                    {sendProgress.failCount > 0 && (
                                        <span className="text-red-600">✗ Başarısız: {sendProgress.failCount}</span>
                                    )}
                                </div>
                                {sendProgress.currentEmail && (
                                    <p className="text-xs text-gray-500">Gönderiliyor: {sendProgress.currentEmail}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscribersPage;
