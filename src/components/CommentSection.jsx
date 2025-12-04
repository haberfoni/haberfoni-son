import React, { useState } from 'react';
import { User, Send, CheckCircle } from 'lucide-react';

const CommentSection = ({ comments = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        comment: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.comment.trim()) return;

        setStatus('submitting');

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setFormData({ name: '', comment: '' });

            // Reset status after a few seconds to allow new comments
            setTimeout(() => {
                setStatus('idle');
            }, 5000);
        }, 1000);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                Yorumlar <span className="ml-2 text-sm font-normal text-gray-500">({comments.length})</span>
            </h3>

            {/* Comment List */}
            <div className="space-y-6 mb-10">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex space-x-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
                                <User size={20} />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-bold text-gray-900">{comment.user}</span>
                                    <span className="text-xs text-gray-400">• {comment.date}</span>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                )}
            </div>

            {/* Comment Form */}
            <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Yorum Yap</h4>

                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3 text-green-800 animate-fade-in">
                        <CheckCircle size={24} className="flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">Yorumunuz gönderildi!</p>
                            <p className="text-sm mt-1">Yorumunuz yönetici onayından geçtikten sonra yayınlanacaktır. Teşekkür ederiz.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                            <input
                                type="text"
                                id="name"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Adınız Soyadınız"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={status === 'submitting'}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Yorum</label>
                            <textarea
                                id="comment"
                                rows="4"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Düşüncelerinizi paylaşın..."
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                required
                                disabled={status === 'submitting'}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {status === 'submitting' ? (
                                <span>Gönderiliyor...</span>
                            ) : (
                                <>
                                    <span>Yorumu Gönder</span>
                                    <Send size={18} className="ml-2" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CommentSection;
