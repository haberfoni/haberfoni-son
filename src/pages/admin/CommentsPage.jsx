import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, Trash2, Clock, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/mappers';

const CommentsPage = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
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
            setComments(comments.map(c => c.id === id ? { ...c, is_approved: true } : c));
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

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <MessageSquare className="text-primary" />
                <span>Yorum Yönetimi</span>
            </h1>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Kullanıcı</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Yorum</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Haber</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Tarih / Durum</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {comments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                        Henüz hiç yorum yapılmamış.
                                    </td>
                                </tr>
                            ) : (
                                comments.map(comment => (
                                    <tr key={comment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 align-top">
                                            <div className="font-medium text-gray-900">{comment.user_name}</div>
                                            <div className="text-xs text-gray-500">{comment.user_email}</div>
                                        </td>
                                        <td className="p-4 align-top w-1/3">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className="text-sm text-gray-600 line-clamp-1">
                                                {comment.news?.title || 'Silinmiş Haber'}
                                            </span>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold w-fit
                                                    ${comment.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {comment.is_approved ? 'Onaylı' : 'Bekliyor'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top text-right space-x-2">
                                            {!comment.is_approved && (
                                                <button
                                                    onClick={() => handleApprove(comment.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Onayla"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(comment.id)}
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
            </div>
        </div>
    );
};

export default CommentsPage;
