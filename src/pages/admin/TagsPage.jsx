import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, X, Check } from 'lucide-react';
import { adminService } from '../../services/adminService';

const TagsPage = () => {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        loadTags();
    }, []);

    const loadTags = async () => {
        try {
            setLoading(true);
            const data = await adminService.getTags();
            setTags(data);
            setSelectedTags([]); // Reset selection on reload
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

    const toggleSelect = (id) => {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter(tId => tId !== id));
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedTags.length === 0) return;
        if (!window.confirm(`${selectedTags.length} adet etiketi silmek istediğinize emin misiniz?`)) return;

        try {
            await adminService.deleteTags(selectedTags);
            setTags(tags.filter(t => !selectedTags.includes(t.id)));
            setSelectedTags([]);
            setMessage({ type: 'success', text: 'Seçilen etiketler silindi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting tags:', error);
            setMessage({ type: 'error', text: 'Toplu silme işlemi başarısız.' });
        }
    };

    // Keep single delete for backward compatibility / ease of use
    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent selection toggle
        if (!window.confirm('Bu etiketi silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteTag(id);
            setTags(tags.filter(t => t.id !== id));
            setSelectedTags(selectedTags.filter(tId => tId !== id));
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div>
                        <h2 className="font-semibold text-gray-700">Mevcut Etiketler ({tags.length})</h2>
                        <p className="text-xs text-red-500 mt-1 font-medium">
                            * Silmek istediğiniz etiketleri seçiniz.
                        </p>
                    </div>
                    {selectedTags.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium animate-in fade-in slide-in-from-right-4"
                        >
                            <Trash2 size={16} className="mr-1.5" />
                            Seçilenleri Sil ({selectedTags.length})
                        </button>
                    )}
                </div>

                {tags.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Henüz hiç etiket eklenmemiş.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => {
                            const isSelected = selectedTags.includes(tag.id);
                            return (
                                <div
                                    key={tag.id}
                                    onClick={() => toggleSelect(tag.id)}
                                    className={`
                                        cursor-pointer inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-all border select-none
                                        ${isSelected
                                            ? 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200 shadow-sm'
                                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                        }
                                    `}
                                >
                                    <span>{tag.name}</span>
                                    {isSelected ? (
                                        <Check size={14} className="ml-2" />
                                    ) : (
                                        <button
                                            onClick={(e) => handleDelete(tag.id, e)}
                                            className="ml-2 text-gray-400 hover:text-red-500 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                                            title="Sil"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagsPage;
