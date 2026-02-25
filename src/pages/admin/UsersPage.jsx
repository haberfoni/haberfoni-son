import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User, Shield, Edit2, Check, X, Plus, Lock, Mail, Type, Trash2 } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ full_name: '', role: 'author' });

    // New User State
    const [isCreating, setIsCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'author'
    });
    const [createLoading, setCreateLoading] = useState(false);

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

    const handleCreateUser = async (e) => {
        e.preventDefault();

        if (createForm.password.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        try {
            setCreateLoading(true);
            await adminService.createUser(createForm.email, createForm.password, {
                full_name: createForm.full_name,
                role: createForm.role
            });

            alert('Kullanıcı başarıyla oluşturuldu!');
            setIsCreating(false);
            setCreateForm({ email: '', password: '', full_name: '', role: 'author' });
            loadUsers();
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Kullanıcı oluşturulurken hata: ' + (error.message || 'Bilinmeyen hata'));
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            await adminService.deleteUser(id);
            alert('Kullanıcı başarıyla silindi.');
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Silme işlemi başarısız: ' + (error.message || 'Bilinmeyen hata'));
        }
    };

    if (loading && !isCreating) {
        return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <User className="mr-3 text-primary" /> Kullanıcı Yönetimi
                </h1>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
                >
                    <Plus size={18} />
                    Yeni Kullanıcı Ekle
                </button>
            </div>

            {/* Main Page Warning Alert */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <div className="text-yellow-600 shrink-0 mt-0.5">
                    <Shield size={20} />
                </div>
                <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Önemli Bilgilendirme</p>
                    <p>
                        Panele yönetici olarak eklenen kişiler veritabanında <strong>Authentication - Users</strong> kısmına da kaydedilmektedir.
                    </p>
                    <p className="mt-1">
                        E-mail onayı (Confirm Email) ayarı açıksa ve mail gitmiyorsa lütfen veritabanınızda <strong>Email Confirm</strong> ayarını kapatınız.
                    </p>
                </div>
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
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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
            </div >

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <Shield className="text-blue-600 mt-1 mr-3" size={20} />
                    <div>
                        <h3 className="text-blue-800 font-semibold mb-1">Yetkilendirme Hakkında</h3>
                        <div className="text-sm text-blue-600">
                            Roller şu an sadece bilgilendirme amaçlıdır. İleride şu şekilde kısıtlamalar eklenebilir:
                            <ul className="list-disc ml-4 mt-2">
                                <li><strong>Yönetici:</strong> Tüm ayarlara ve kullanıcılara erişebilir.</li>
                                <li><strong>Editör:</strong> Sadece haber, galeri ve yorum yönetebilir.</li>
                                <li><strong>Yazar:</strong> Sadece kendi yazılarını görebilir ve düzenleyebilir.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            {
                isCreating && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 overflow-hidden">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-lg w-full m-4">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Yeni Kullanıcı Ekle</h2>
                                    <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-gray-700">
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Warning Alert */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                                    <div className="text-yellow-600 shrink-0 mt-0.5">
                                        <Shield size={20} />
                                    </div>
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-semibold mb-1">Önemli Bilgilendirme</p>
                                        <p>
                                            Panele yönetici olarak eklenen kişiler veritabanında <strong>Authentication - Users</strong> kısmına da kaydedilmektedir.
                                        </p>
                                        <p className="mt-2 text-yellow-700">
                                            E-mail onayı (Confirm Email) ayarı açıksa ve mail gitmiyorsa lütfen sistem ayarlarından e-mail sağlayıcısını kontrol ediniz.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail size={16} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                                placeholder="ornek@haberfoni.com"
                                                value={createForm.email}
                                                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock size={16} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                                placeholder="En az 6 karakter"
                                                value={createForm.password}
                                                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Type size={16} className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                                placeholder="Ad Soyad"
                                                value={createForm.full_name}
                                                onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Rolü</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                            value={createForm.role}
                                            onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                        >
                                            <option value="author">Yazar (Standart)</option>
                                            <option value="editor">Editör (Haber/Galeri Yönetimi)</option>
                                            <option value="admin">Yönetici (Tam Erişim)</option>
                                        </select>
                                    </div>

                                    <div className="pt-2 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreating(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            Vazgeç
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createLoading}
                                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex justify-center items-center"
                                        >
                                            {createLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default UsersPage;
