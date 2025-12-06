import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User, Shield, Edit2, Check, X } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ full_name: '', role: 'author' });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getProfiles();
            setUsers(data || []);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Kullanıcılar yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setEditForm({
            full_name: user.full_name || '',
            role: user.role || 'author'
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ full_name: '', role: 'author' });
    };

    const handleSave = async (id) => {
        try {
            await adminService.updateUserProfile(id, editForm);
            setEditingId(null);
            loadUsers(); // Refresh list
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Kullanıcı güncellenirken hata oluştu.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <User className="mr-3 text-primary" /> Kullanıcı Yönetimi
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">E-posta</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Ad Soyad</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Rol</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Kayıt Tarihi</th>
                            <th className="px-6 py-4 font-semibold text-gray-600 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-gray-800 font-medium">
                                    {user.email || 'Bilinmiyor (Auth ID only)'}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {editingId === user.id ? (
                                        <input
                                            type="text"
                                            value={editForm.full_name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="Ad Soyad"
                                        />
                                    ) : (
                                        user.full_name || '-'
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingId === user.id ? (
                                        <select
                                            value={editForm.role}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="author">Yazar</option>
                                            <option value="editor">Editör</option>
                                            <option value="admin">Yönetici</option>
                                        </select>
                                    ) : (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {user.role === 'admin' ? 'Yönetici' :
                                                user.role === 'editor' ? 'Editör' : 'Yazar'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {editingId === user.id ? (
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleSave(user.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Kaydet"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="İptal"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Düzenle"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                    Henüz kullanıcı profili bulunmuyor.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <Shield className="text-blue-600 mt-1 mr-3" size={20} />
                    <div>
                        <h3 className="text-blue-800 font-semibold mb-1">Yetkilendirme Hakkında</h3>
                        <p className="text-sm text-blue-600">
                            Roller şu an sadece bilgilendirme amaçlıdır. İleride şu şekilde kısıtlamalar eklenebilir:
                            <ul className="list-disc ml-4 mt-2">
                                <li><strong>Yönetici:</strong> Tüm ayarlara ve kullanıcılara erişebilir.</li>
                                <li><strong>Editör:</strong> Sadece haber, galeri ve yorum yönetebilir.</li>
                                <li><strong>Yazar:</strong> Sadece kendi yazılarını görebilir ve düzenleyebilir.</li>
                            </ul>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
