import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Check, Trash2, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { slugify } from '../../utils/slugify';

const CommentsPage = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadComments();
    }, []);

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await adminService.getComments();
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
            setMessage({ type: 'error', text: 'Yorumlar yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await adminService.approveComment(id);
            // Update local state
            setComments(comments.map(c =>
                c.id === id ? { ...c, is_approved: true } : c
            ));
            setMessage({ type: 'success', text: 'Yorum onaylandı.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error approving comment:', error);
            setMessage({ type: 'error', text: 'Onaylama işlemi başarısız.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteComment(id);
            setComments(comments.filter(c => c.id !== id));
            setMessage({ type: 'success', text: 'Yorum silindi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting comment:', error);
            setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
        }
    };

    const filteredComments = comments.filter(c => {
        if (activeTab === 'pending') return c.is_approved === false;
        if (activeTab === 'approved') return c.is_approved === true;
        return true;
    });

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <MessageSquare className="text-primary" />
                <span>Yorum Yönetimi ({comments.filter(c => !c.is_approved).length} Bekleyen)</span>
            </h1>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Bekleyen Yorumlar
                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs py-0.5 px-2 rounded-full">
                        {comments.filter(c => !c.is_approved).length}
                    </span>
                </button>
                <button
                    className={`pb-3 px-4 font-medium transition-colors border-b-2 ${activeTab === 'approved' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('approved')}
                >
                    Onaylananlar
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {filteredComments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {activeTab === 'pending' ? 'Onay bekleyen yorum yok.' : 'Henüz onaylanmış yorum yok.'}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredComments.map((comment) => {
                            // Helper to parse news object safely
                            const newsItem = Array.isArray(comment.news) ? comment.news[0] : comment.news;
                            const newsCategory = newsItem?.category || 'gundem';
                            const newsTitle = newsItem?.title || 'Bilinmeyen Haber';
                            const newsSlug = newsItem?.slug || slugify(newsTitle);

                            return (
                                <div key={comment.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-gray-900">{comment.user_name}</span>
                                                <span className="text-gray-400 text-xs">•</span>
                                                <span className="text-gray-500 text-sm">{new Date(comment.created_at).toLocaleString('tr-TR')}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 mt-2">
                                                {newsItem ? (
                                                    <>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                                                            {newsCategory}
                                                        </span>
                                                        <Link
                                                            to={`/kategori/${slugify(newsCategory)}/${slugify(newsTitle)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center hover:underline font-medium"
                                                        >
                                                            {newsTitle}
                                                            <ExternalLink size={14} className="ml-1" />
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Bilinmeyen Haber</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {!comment.is_approved && (
                                                <button
                                                    onClick={() => handleApprove(comment.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Onayla"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {comment.comment}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentsPage;
