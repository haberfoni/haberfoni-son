import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

import { Save, RefreshCw, Power, AlertTriangle, CheckCircle, Plus, Trash2, Link as LinkIcon, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

const BotSettingsPage = () => {
    const [settings, setSettings] = useState([]);
    const [mappings, setMappings] = useState({}); // { 'AA': [], 'DHA': [] }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [newMapping, setNewMapping] = useState({ source: '', url: '', category: '' });

    const [categories, setCategories] = useState([]);

    const [botStatus, setBotStatus] = useState(null);

    useEffect(() => {
        loadData();
        checkBotStatus();
        const interval = setInterval(() => {
            checkBotStatus();
            loadData(true); // Refresh mappings to show updated timestamps
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const checkBotStatus = async () => {
        const status = await adminService.getBotStatus();
        setBotStatus(status);
    };

    const handleTriggerBot = async () => {
        if (!window.confirm('Botu şimdi tetiklemek istiyor musunuz? Bu işlem tüm kaynakları tarayacaktır.')) return;
        try {
            await adminService.triggerBot();
            setMessage({ type: 'success', text: 'Komut gönderildi. Bot birazdan çalışacak.' });
            checkBotStatus();
        } catch (error) {
            setMessage({ type: 'error', text: 'Komut gönderilemedi.' });
        }
    };

    const loadData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            // Load Settings
            const settingsData = await adminService.getBotSettings();

            if (!settingsData) {
                setMessage({ type: 'warning', text: 'Bot ayarları alınamadı.' });
            } else {
                setSettings(settingsData || []);

                // Load Mappings for each source
                const mappingsMap = {};
                for (const setting of settingsData || []) {
                    const sourceMappings = await adminService.getBotMappings(setting.source_name);
                    mappingsMap[setting.source_name] = sourceMappings;
                }
                setMappings(mappingsMap);
            }

            // Load Categories for dropdown
            const cats = await adminService.getCategories();
            setCategories(cats || []);

        } catch (error) {
            console.error('Error loading data:', error);
            setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu.' });
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleToggle = (id, field) => {
        setSettings(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, [field]: !item[field] };
            }
            return item;
        }));
    };

    const handleSave = async (id) => {
        const item = settings.find(s => s.id === id);
        if (!item) return;

        setSaving(true);
        try {
            await adminService.updateBotSetting(id, {
                auto_publish: item.auto_publish,
                is_active: item.is_active,
                updated_at: new Date()
            });

            setMessage({ type: 'success', text: `${item.source_name} ayarları kaydedildi.` });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Kaydetme başarısız: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleAddMapping = async (sourceName) => {
        if (!newMapping.url || !newMapping.category) return;

        try {
            const newEntry = {
                source_name: sourceName,
                source_url: newMapping.url,
                target_category: newMapping.category,
                is_active: true
            };

            const added = await adminService.addBotMapping(newEntry);

            setMappings(prev => ({
                ...prev,
                [sourceName]: [added, ...(prev[sourceName] || [])]
            }));

            setNewMapping({ source: '', url: '', category: '' });
            setMessage({ type: 'success', text: 'Eşleştirme eklendi.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Ekleme başarısız: ' + error.message });
        }
    };

    const handleDeleteMapping = async (sourceName, id) => {
        if (!window.confirm('Bu eşleştirmeyi silmek istediğinize emin misiniz?')) return;

        try {
            await adminService.deleteBotMapping(id);
            setMappings(prev => ({
                ...prev,
                [sourceName]: prev[sourceName].filter(m => m.id !== id)
            }));
            setMessage({ type: 'success', text: 'Eşleştirme silindi.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Silme başarısız.' });
        }
    }

    if (loading && !message) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <RefreshCw className="mr-2" /> Bot ve Otomatik Haber Ayarları
            </h1>

            {message && (
                <div className={`p-4 rounded-lg mb-6 flex items-start ${message.type === 'error' ? 'bg-red-50 text-red-700' : message.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                    {message.type === 'error' && <AlertTriangle className="mr-2 mt-0.5" size={18} />}
                    {message.type === 'warning' && <AlertTriangle className="mr-2 mt-0.5" size={18} />}
                    {message.type === 'success' && <CheckCircle className="mr-2 mt-0.5" size={18} />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* System Control Panel */}
                <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center">
                            <span className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Sistem Durumu
                        </h2>
                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <p>
                                <span className="font-medium text-gray-500">Son Komut:</span>{' '}
                                {botStatus ? (
                                    <span className={`font-mono font-semibold ${botStatus.status === 'PENDING' ? 'text-yellow-600' : botStatus.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-600'}`}>
                                        {botStatus.command} ({botStatus.status})
                                    </span>
                                ) : 'Yok'}
                            </p>
                            {botStatus && botStatus.updated_at && (
                                <p className="flex items-center text-indigo-600 font-medium">
                                    <Clock size={16} className="mr-1" />
                                    Son İşlem: {formatDistanceToNow(new Date(botStatus.updated_at), { addSuffix: true, locale: tr })}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleTriggerBot}
                        disabled={botStatus?.status === 'PENDING' || botStatus?.status === 'PROCESSING'}
                        className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center"
                    >
                        <RefreshCw size={18} className={`mr-2 ${botStatus?.status === 'PENDING' ? 'animate-spin' : ''}`} />
                        Botu Şimdi Tetikle
                    </button>
                </div>

                {settings.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-bold text-gray-800">{item.source_name} Botu</h2>
                                <button
                                    onClick={() => handleToggle(item.id, 'is_active')}
                                    className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}
                                >
                                    <Power size={14} className="mr-1" />
                                    {item.is_active ? 'Aktif' : 'Pasif'}
                                </button>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={item.auto_publish}
                                        onChange={() => handleToggle(item.id, 'auto_publish')}
                                    />
                                    <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                    <span className="ms-2 text-xs font-medium text-gray-600">
                                        Otomatik Yayınla (Kapalıysa Taslak Olur)
                                    </span>
                                </label>
                                <button
                                    onClick={() => handleSave(item.id)}
                                    disabled={saving}
                                    className="bg-primary hover:bg-primary-dark text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center disabled:opacity-50 transition-colors"
                                >
                                    <Save size={16} className="mr-1" /> Kaydet
                                </button>
                            </div>
                        </div>

                        {/* Mappings Config */}
                        <div className="p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <LinkIcon size={16} className="mr-2" /> Kategori Eşleştirmeleri (Hangi link &rarr; Hangi kategoriye?)
                            </h3>

                            {/* Existing Mappings */}
                            <div className="space-y-2 mb-4">
                                {mappings[item.source_name]?.length > 0 ? (
                                    mappings[item.source_name].map(map => (
                                        <div key={map.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100 text-sm">
                                            <div className="flex-1 mr-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                                    <div className="text-gray-600 truncate" title={map.source_url}>{map.source_url}</div>
                                                    <div className="font-semibold text-gray-800 flex items-center">
                                                        <span className="text-gray-400 mr-2">→</span> {map.target_category}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center">
                                                    {map.last_scraped_at ? (
                                                        <span title={new Date(map.last_scraped_at).toLocaleString()} className={map.last_status === 'Success' ? 'text-green-600' : 'text-red-500'}>
                                                            Son İşlem: {new Date(map.last_scraped_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                            <span className="mx-1">•</span>
                                                            {map.last_item_count} Haber
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">Henüz çalışmadı</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteMapping(item.source_name, map.id)}
                                                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                title="Sil"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-400 italic p-2">Henüz link eklenmemiş. Varsayılan (gundem) veya tüm haberler çekilemeyecektir.</div>
                                )}
                            </div>

                            {/* Add New Mapping */}
                            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <input
                                    type="text"
                                    placeholder="RSS/XML Linki (Örn: https://...)"
                                    className="flex-1 text-sm border-gray-300 rounded focus:border-primary focus:ring-primary"
                                    value={newMapping.source === item.source_name ? newMapping.url : ''}
                                    onChange={(e) => setNewMapping({ ...newMapping, source: item.source_name, url: e.target.value })}
                                />
                                <select
                                    className="w-full md:w-48 text-sm border-gray-300 rounded focus:border-primary focus:ring-primary"
                                    value={newMapping.source === item.source_name ? newMapping.category : ''}
                                    onChange={(e) => setNewMapping({ ...newMapping, source: item.source_name, category: e.target.value })}
                                >
                                    <option value="">Kategori Seçin</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => handleAddMapping(item.source_name)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center whitespace-nowrap"
                                >
                                    <Plus size={16} className="mr-1" /> Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                <h3 className="font-semibold mb-2 flex items-center"><AlertTriangle size={16} className="mr-2" /> Önemli Bilgi</h3>
                <p>Bot her çalıştırıldığında (15 dk bir) yukarıdaki tanımlı linkleri sırayla tarar. Eğer hiç link tanımlamazsanız bot çalışsa bile haber çekemez.</p>
                <p className="mt-1">Kategori slug'ını doğru yazdığınızdan emin olun (Örn: 'gundem', 'spor', 'dunya'). Admin paneli kategori listesinden slugları kontrol edebilirsiniz.</p>
            </div>
        </div >
    );
};

export default BotSettingsPage;
