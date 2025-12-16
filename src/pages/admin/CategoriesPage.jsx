import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, Check, X, Eye, EyeOff, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { adminService } from '../../services/adminService';
import { slugify } from '../../utils/slugify';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({ name: '', slug: '' });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null); // ID of category being edited
    const [editForm, setEditForm] = useState({ name: '', slug: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [manualSlug, setManualSlug] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await adminService.getCategories();
            // Ensure data is sorted by order_index
            const sorted = data.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
            setCategories(sorted);
        } catch (error) {
            console.error('Error loading categories:', error);
            if (error.message && error.message.includes('404')) {
                // Table might not exist yet
            } else {
                setMessage({ type: 'error', text: 'Kategoriler yüklenirken hata oluştu: ' + error.message });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            // New category gets last order index
            const added = await adminService.addCategory(formData.name, formData.slug);
            // Reload to ensure order is correct
            loadCategories();
            setFormData({ name: '', slug: '' });
            setManualSlug(false);
            setMessage({ type: 'success', text: 'Kategori başarıyla eklendi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error adding category:', error);
            if (error && error.code === '23505') {
                setMessage({ type: 'error', text: 'Bu kategori veya link zaten var.' });
            } else {
                setMessage({ type: 'error', text: 'Kategori eklenirken hata: ' + (error.message || error) });
            }
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update local state immediately for UI responsiveness
        setCategories(items);

        try {
            // Prepare batch updates
            // We re-assign order_index based on new array position (1-based)
            const updates = items.map((item, index) => ({
                id: item.id,
                order_index: index + 1
            }));

            await adminService.reorderCategories(updates);
        } catch (error) {
            console.error('Reorder error:', error);
            setMessage({ type: 'error', text: 'Sıralama kaydedilemedi.' });
            loadCategories(); // Revert
        }
    };

    const startEdit = (cat) => {
        setIsEditing(cat.id);
        setEditForm({ name: cat.name, slug: cat.slug });
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setEditForm({ name: '', slug: '' });
    };

    const saveEdit = async (id) => {
        try {
            const updated = await adminService.updateCategory(id, editForm);
            // Updating one item might not change order, so just map
            setCategories(categories.map(c => c.id === id ? { ...updated, order_index: c.order_index } : c));
            setIsEditing(null);
            setMessage({ type: 'success', text: 'Kategori güncellendi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error updating category:', error);
            setMessage({ type: 'error', text: 'Güncelleme hatası: ' + error.message });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteCategory(id);
            setCategories(categories.filter(c => c.id !== id));
            setMessage({ type: 'success', text: 'Kategori silindi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error deleting category:', error);
            setMessage({ type: 'error', text: 'Silme işlemi başarısız.' });
        }
    };

    const toggleStatus = async (cat) => {
        const currentStatus = cat.is_active !== false;
        const newStatus = !currentStatus;

        try {
            const updatedCategories = categories.map(c =>
                c.id === cat.id ? { ...c, is_active: newStatus } : c
            );
            setCategories(updatedCategories);

            await adminService.updateCategory(cat.id, { is_active: newStatus });
        } catch (error) {
            console.error('Error toggling status:', error);
            if (error.message && error.message.includes('Could not find the \'is_active\' column')) {
                setMessage({ type: 'error', text: 'Veritabanında "is_active" sütunu eksik. Lütfen SQL panelinden bu sütunu ekleyin.' });
            } else {
                setMessage({ type: 'error', text: 'Durum değiştirilemedi: ' + error.message });
            }
            loadCategories();
        }
    };

    const handleNameChange = (e) => {
        const name = e.target.value;
        setFormData(prev => {
            const updates = { ...prev, name };
            if (!manualSlug) {
                updates.slug = slugify(name);
            }
            return updates;
        });
    };

    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const openEditModal = (cat) => {
        setEditingCategory({
            ...cat,
            seo_title: cat.seo_title || '',
            seo_description: cat.seo_description || '',
            seo_keywords: cat.seo_keywords || ''
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingCategory(null);
    };

    const saveEditModal = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateCategory(editingCategory.id, {
                name: editingCategory.name,
                slug: editingCategory.slug,
                seo_title: editingCategory.seo_title,
                seo_description: editingCategory.seo_description,
                seo_keywords: editingCategory.seo_keywords
            });

            // Optimistic update
            setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c));
            setMessage({ type: 'success', text: 'Kategori güncellendi.' });
            closeEditModal();
        } catch (err) {
            console.error('Update error:', err);
            setMessage({ type: 'error', text: 'Güncelleme hatası.' });
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Layers className="text-primary" />
                <span>Kategori Yönetimi</span>
            </h1>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Add New Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Yeni Kategori Ekle</h2>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={handleNameChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            placeholder="Örn: Gündem, Ekonomi"
                            required
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700">Link (Slug)</label>
                            <label className="flex items-center space-x-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={manualSlug}
                                    onChange={(e) => setManualSlug(e.target.checked)}
                                    className="w-3 h-3 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="text-xs text-gray-500">Manuel Düzenle</span>
                            </label>
                        </div>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm ${!manualSlug ? 'bg-gray-100 text-gray-500' : 'bg-white'}`}
                            placeholder="kategori-linki"
                            required
                            readOnly={!manualSlug}
                        />
                    </div>

                    {/* SEO Fields */}
                    <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-100 mt-2">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">SEO (Opsiyonel)</span>
                            Arama Motoru Ayarları
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Başlık (Title)</label>
                                <input
                                    type="text"
                                    value={formData.seo_title || ''}
                                    onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Örn: Güncel Ekonomi Haberleri"
                                />
                                <p className="text-xs text-gray-500 mt-1">Sona otomatik olarak " | Site Adı" eklenir.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Anahtar Kelimeler</label>
                                <input
                                    type="text"
                                    value={formData.seo_keywords || ''}
                                    onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Örn: ekonomi, dolar, borsa"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">SEO Açıklama (Description)</label>
                                <textarea
                                    value={formData.seo_description || ''}
                                    onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                                    placeholder="Kategori için meta açıklama..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                            disabled={!formData.name.trim()}
                        >
                            <Plus size={18} />
                            <span>Kategori Ekle</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-700">Mevcut Kategoriler ({categories?.length || 0})</h2>
                </div>

                {(!categories || categories.length === 0) ? (
                    <div className="p-8 text-center text-gray-500">
                        Henüz hiç kategori eklenmemiş.
                    </div>
                ) : (
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm">
                                        <th className="p-4 w-12">#</th>
                                        <th className="p-4 w-12"></th>
                                        <th className="p-4 font-medium">Kategori Adı</th>
                                        <th className="p-4 font-medium">Link (Slug)</th>
                                        <th className="p-4 font-medium text-center">Durum</th>
                                        <th className="p-4 font-medium text-center">Haber Sayısı</th>
                                        <th className="p-4 font-medium text-center">Ana Sayfa</th>
                                        <th className="p-4 font-medium text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <Droppable droppableId="categories-list">
                                    {(provided) => (
                                        <tbody
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="divide-y divide-gray-100"
                                        >
                                            {categories.map((cat, index) => (
                                                <Draggable key={cat.id} draggableId={cat.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <tr
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`hover:bg-gray-50 transition-colors ${snapshot.isDragging ? 'bg-blue-50 shadow-md' : 'bg-white'}`}
                                                        >
                                                            <td className="p-4 text-gray-400 font-mono text-sm">
                                                                {index + 1}
                                                            </td>
                                                            <td className="p-4 text-gray-400 cursor-grab active:cursor-grabbing" {...provided.dragHandleProps}>
                                                                <GripVertical size={20} />
                                                            </td>
                                                            <td className="p-4 font-medium text-gray-900">{cat.name}</td>
                                                            <td className="p-4 text-gray-500 font-mono text-sm">{cat.slug}</td>
                                                            <td className="p-4 text-center">
                                                                <button
                                                                    onClick={() => toggleStatus(cat)}
                                                                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${cat.is_active !== false ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-gray-600 bg-gray-200 hover:bg-gray-300'}`}
                                                                >
                                                                    {cat.is_active !== false ? 'Aktif' : 'Pasif'}
                                                                </button>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                                    {cat.news_count || 0}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                {cat.is_visible_on_homepage ? (
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        <Check size={12} className="mr-1" />
                                                                        Görünüyor
                                                                    </span>
                                                                ) : (
                                                                    <div className="flex flex-col items-center gap-1 group relative">
                                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${!cat.homepage_config_enabled ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                            {!cat.homepage_config_enabled ? 'Devre Dışı' : 'Yetersiz'}
                                                                        </span>
                                                                        {cat.news_count < 4 && cat.homepage_config_enabled && (
                                                                            <span className="absolute -top-8 w-32 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                                                En az 4 haber gerekli
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="p-4 text-right space-x-2">
                                                                <button
                                                                    onClick={() => openEditModal(cat)}
                                                                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                                                                    title="Düzenle"
                                                                >
                                                                    <Edit2 size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(cat.id)}
                                                                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                                                    title="Sil"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </tbody>
                                    )}
                                </Droppable>
                            </table>
                        </div>
                    </DragDropContext>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingCategory && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">Kategori Düzenle</h2>
                            <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={saveEditModal} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
                                    <input
                                        type="text"
                                        value={editingCategory.name}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Link)</label>
                                    <input
                                        type="text"
                                        value={editingCategory.slug}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, slug: slugify(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                                        required
                                    />
                                </div>
                            </div>

                            {/* SEO Fields in Modal */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs mr-2">SEO</span>
                                    Arama Motoru Ayarları
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Başlık</label>
                                        <input
                                            type="text"
                                            value={editingCategory.seo_title || ''}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, seo_title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Sona otomatik olarak " | Site Adı" eklenir.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Anahtar Kelimeler</label>
                                        <input
                                            type="text"
                                            value={editingCategory.seo_keywords || ''}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, seo_keywords: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SEO Açıklama</label>
                                        <textarea
                                            value={editingCategory.seo_description || ''}
                                            onChange={(e) => setEditingCategory({ ...editingCategory, seo_description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm h-24 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                    Değişiklikleri Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesPage;
