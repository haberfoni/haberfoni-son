import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { adminService } from '../../services/adminService';

const TagsPage = () => {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setLoading(true);
            const data = await adminService.getTags();
            setTags(data);
        } catch (error) {
            console.error('Error loading tags:', error);
            setMessage({ type: 'error', text: 'Etiketler yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddTag = async (e) => {
        e.preventDefault();
        if (!newTag.trim()) return;

        try {
            const addedTag = await adminService.addTag(newTag);
            setTags([...tags, addedTag]);
            setNewTag('');
            setMessage({ type: 'success', text: 'Etiket başarıyla eklendi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error adding tag:', error);
            setMessage({ type: 'error', text: 'Etiket eklenirken hata oluştu.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu etiketi silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteTag(id);
            setTags(tags.filter(t => t.id !== id));
            setMessage({ type: 'success', text: 'Etiket silindi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting tag:', error);
            setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Tag className="text-primary" />
                <span>Etiket Yönetimi</span>
            </h1>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <form onSubmit={handleAddTag} className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="newTag" className="sr-only">Yeni Etiket</label>
                        <input
                            type="text"
                            id="newTag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="Yeni etiket adı yazın..."
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
                        disabled={!newTag.trim()}
                    >
                        <Plus size={18} />
                        <span>Ekle</span>
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-700 mb-4">Mevcut Etiketler ({tags.length})</h2>

                {tags.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Henüz hiç etiket eklenmemiş.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <div
                                key={tag.id}
                                className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm group hover:bg-gray-200 transition-colors"
                            >
                                <span>{tag.name}</span>
                                <button
                                    onClick={() => handleDelete(tag.id)}
                                    className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Sil"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagsPage;
