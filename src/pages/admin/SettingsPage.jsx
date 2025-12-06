import React, { useState, useEffect } from 'react';
import { Save, Globe, Share2, Search, Key, Shield, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/adminService';

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('general');

    // Initial state
    const [settings, setSettings] = useState({
        site_title: '',
        site_description: '',
        google_analytics_id: '',
        google_adsense_id: '',
        yandex_metrica_id: '',
        google_search_console_id: '', // New
        google_recaptcha_site_key: '', // New
        google_youtube_api_key: '', // New
        copy_protection: 'false', // New (stored as string in DB for consistency, or boolean if handled)
        social_facebook: '',
        social_twitter: '',
        social_instagram: '',
        social_youtube: '',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await adminService.getSettings();
            // Merge with default state to handle missing keys
            setSettings(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error('Error loading settings:', error);
            setMessage({ type: 'error', text: 'Ayarlar yüklenirken bir hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'true' : 'false') : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Prepare array for bulk update
            const settingsArray = Object.keys(settings).map(key => ({
                key,
                value: settings[key]?.toString() || '' // Ensure string format
            }));

            await adminService.updateSettingsBulk(settingsArray);
            setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu.' });
        } finally {
            setSaving(false);
            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    const tabs = [
        { id: 'general', label: 'Genel Ayarlar', icon: <Globe size={18} /> },
        { id: 'seo', label: 'SEO & API', icon: <Search size={18} /> },
        { id: 'social', label: 'Sosyal Medya', icon: <Share2 size={18} /> },
        { id: 'security', label: 'Güvenlik & Diğer', icon: <Shield size={18} /> },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Site Ayarları</h1>
                    <p className="text-gray-500">Genel yapılandırma, API anahtarları ve entegrasyonlar.</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <Save size={20} />
                    <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors border-b-2
                                ${activeTab === tab.id
                                    ? 'border-primary text-primary bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Site Başlığı</label>
                                <input
                                    type="text"
                                    name="site_title"
                                    value={settings.site_title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="Örn: Haberfoni"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Site Açıklaması (Meta Description)</label>
                                <textarea
                                    name="site_description"
                                    value={settings.site_description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="Site içeriği hakkında kısa bilgi..."
                                />
                            </div>
                        </div>
                    )}

                    {/* SEO & API Settings */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID (G-XXXXXXXX)</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="google_analytics_id"
                                            value={settings.google_analytics_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="G-..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Yandex Metrica ID</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="yandex_metrica_id"
                                            value={settings.yandex_metrica_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="XXXXXXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Adsense ID (ca-pub-XXXXXXXX)</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="google_adsense_id"
                                            value={settings.google_adsense_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="ca-pub-..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Search Console Kodu</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="google_search_console_id"
                                            value={settings.google_search_console_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="HTML Tag content only"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Youtube API Key</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="google_youtube_api_key"
                                            value={settings.google_youtube_api_key}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Recaptcha Site Key</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="google_recaptcha_site_key"
                                            value={settings.google_recaptcha_site_key}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Media Settings */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                                    <input
                                        type="url"
                                        name="social_facebook"
                                        value={settings.social_facebook}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        placeholder="https://facebook.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter (X) URL</label>
                                    <input
                                        type="url"
                                        name="social_twitter"
                                        value={settings.social_twitter}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        placeholder="https://twitter.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                                    <input
                                        type="url"
                                        name="social_instagram"
                                        value={settings.social_instagram}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        placeholder="https://instagram.com/..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Youtube URL</label>
                                    <input
                                        type="url"
                                        name="social_youtube"
                                        value={settings.social_youtube}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                        placeholder="https://youtube.com/..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security & Other Settings */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                                <AlertTriangle className="text-yellow-600" size={24} />
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">İçerik Kopyalama Koruması</h4>
                                    <p className="text-sm text-gray-600">
                                        Aktif edildiğinde sağ tık, metin seçimi ve CTRL+C gibi kısayollar engellenir.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="copy_protection"
                                        className="sr-only peer"
                                        checked={settings.copy_protection === 'true'}
                                        onChange={handleChange}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
