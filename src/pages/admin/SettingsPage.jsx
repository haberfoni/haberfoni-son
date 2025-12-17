import React, { useState, useEffect } from 'react';
import { Save, Globe, Share2, Search, Key, Shield, AlertTriangle, Plus, Trash2, Image } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SOCIAL_PLATFORMS, getIcon } from '../../utils/iconMapper';

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState({}); // Track upload status per field
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('general');

    // Dynamic Social Media State
    const [socialLinks, setSocialLinks] = useState([]);
    const [newSocial, setNewSocial] = useState({ platform: 'facebook', url: '' });

    // Initial state
    const [settings, setSettings] = useState({
        site_title: '',
        site_description: '',
        logo_desktop: '',
        logo_mobile: '',
        favicon: '',
        site_copyright: '', // Added copyright
        google_analytics_id: '',
        google_adsense_id: '',
        yandex_metrica_id: '',
        google_search_console_id: '',
        google_recaptcha_site_key: '',
        google_youtube_api_key: '',
        copy_protection: 'false',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await adminService.getSettings();

            // Set basic settings
            setSettings(prev => ({ ...prev, ...data }));

            // Handle Social Links (Migration or Load)
            if (data.social_links) {
                try {
                    const parsedLinks = JSON.parse(data.social_links);
                    setSocialLinks(Array.isArray(parsedLinks) ? parsedLinks : []);
                } catch (e) {
                    // console.error("Error parsing social_links", e);
                    setSocialLinks([]);
                }
            } else {
                // Migration: Check for legacy columns if social_links doesn't exist
                const migratedLinks = [];
                if (data.social_facebook) migratedLinks.push({ platform: 'facebook', url: data.social_facebook });
                if (data.social_twitter) migratedLinks.push({ platform: 'twitter', url: data.social_twitter });
                if (data.social_instagram) migratedLinks.push({ platform: 'instagram', url: data.social_instagram });
                if (data.social_youtube) migratedLinks.push({ platform: 'youtube', url: data.social_youtube });

                setSocialLinks(migratedLinks);
            }

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

    const handleImageUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(prev => ({ ...prev, [fieldName]: true }));
            const imageUrl = await adminService.uploadImage(file, 'images'); // Use generic images bucket or specific logo bucket

            setSettings(prev => ({
                ...prev,
                [fieldName]: imageUrl
            }));

            setMessage({ type: 'success', text: 'Görsel başarıyla yüklendi. Kalıcı olması için "Kaydet" butonuna basmayı unutmayın.' });
        } catch (error) {
            console.error('Upload Error:', error);
            setMessage({ type: 'error', text: 'Görsel yüklenirken hata: ' + error.message });
        } finally {
            setUploading(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    // Social Media Handlers
    const handleAddSocial = () => {
        if (!newSocial.url) return;
        setSocialLinks([...socialLinks, newSocial]);
        setNewSocial({ platform: 'facebook', url: '' }); // Reset
    };

    const handleRemoveSocial = (index) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Prepare array for bulk update
            // Filter out social_links to avoid duplicates (we add it manually below)
            const settingsArray = Object.keys(settings)
                .filter(key => key !== 'social_links')
                .map(key => ({
                    key,
                    value: settings[key]?.toString() || ''
                }));

            // Add Social Links as JSON string
            settingsArray.push({
                key: 'social_links',
                value: JSON.stringify(socialLinks)
            });

            await adminService.updateSettingsBulk(settingsArray);
            setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Kaydedilirken bir hata oluştu.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    const tabs = [
        { id: 'general', label: 'Genel Ayarlar', icon: <Globe size={18} /> },
        { id: 'branding', label: 'Marka & Görseller', icon: <Image size={18} /> },
        { id: 'seo', label: 'SEO & API', icon: <Search size={18} /> },
        { id: 'warning', label: 'Duyuru & Uyarı', icon: <AlertTriangle size={18} /> },
        { id: 'social', label: 'Sosyal Medya', icon: <Share2 size={18} /> },
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
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap
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
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                                <p className="text-sm text-blue-700">
                                    Bu alandaki SEO ayarları <strong>sadece Ana Sayfa</strong> için geçerlidir.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Site Adı (Title)</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Site Açıklaması (Description)</label>
                                <textarea
                                    name="site_description"
                                    value={settings.site_description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="Site içeriği hakkında kısa bilgi..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Footer Telif Metni</label>
                                <input
                                    type="text"
                                    name="site_copyright"
                                    value={settings.site_copyright}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    placeholder="© 2024 Haberfoni. Tüm hakları saklıdır."
                                />
                            </div>
                        </div>
                    )}

                    {/* Branding Settings */}
                    {activeTab === 'branding' && (
                        <div className="space-y-8">
                            {/* Desktop Logo */}
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Masaüstü Logo</h3>
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Seç</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'logo_desktop')}
                                            disabled={uploading.logo_desktop}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-black file:text-white
                                                hover:file:bg-gray-800"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Önerilen boyut: 200x48px (PNG veya SVG)</p>
                                    </div>
                                    <div className="w-full md:w-1/2 min-h-[100px] flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden">
                                        {uploading.logo_desktop ? (
                                            <div className="text-gray-500">Yükleniyor...</div>
                                        ) : settings.logo_desktop ? (
                                            <div className="relative group w-full h-full flex items-center justify-center p-4">
                                                <img src={settings.logo_desktop} alt="Desktop Logo" className="max-h-24 max-w-full object-contain" />
                                                <button
                                                    onClick={() => setSettings(prev => ({ ...prev, logo_desktop: '' }))}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Kaldır"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Önizleme Yok</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Logo */}
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Mobil Logo</h3>
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Seç</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'logo_mobile')}
                                            disabled={uploading.logo_mobile}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-black file:text-white
                                                hover:file:bg-gray-800"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Önerilen boyut: 150x40px (PNG veya SVG)</p>
                                    </div>
                                    <div className="w-full md:w-1/2 min-h-[100px] flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden">
                                        {uploading.logo_mobile ? (
                                            <div className="text-gray-500">Yükleniyor...</div>
                                        ) : settings.logo_mobile ? (
                                            <div className="relative group w-full h-full flex items-center justify-center p-4">
                                                <img src={settings.logo_mobile} alt="Mobile Logo" className="max-h-24 max-w-full object-contain" />
                                                <button
                                                    onClick={() => setSettings(prev => ({ ...prev, logo_mobile: '' }))}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Kaldır"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Önizleme Yok</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Favicon */}
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Favicon (Tarayıcı İkonu)</h3>
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Seç</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, 'favicon')}
                                            disabled={uploading.favicon}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-black file:text-white
                                                hover:file:bg-gray-800"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Önerilen boyut: 32x32px veya 16x16px (ICO veya PNG)</p>
                                    </div>
                                    <div className="w-full md:w-1/2 min-h-[100px] flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg relative overflow-hidden">
                                        {uploading.favicon ? (
                                            <div className="text-gray-500">Yükleniyor...</div>
                                        ) : settings.favicon ? (
                                            <div className="relative group w-full h-full flex items-center justify-center p-4">
                                                <img src={settings.favicon} alt="Favicon" className="w-8 h-8 object-contain" />
                                                <button
                                                    onClick={() => setSettings(prev => ({ ...prev, favicon: '' }))}
                                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Kaldır"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Önizleme Yok</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SEO & API Settings */}
                    {activeTab === 'seo' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="google_analytics_id"
                                            value={settings.google_analytics_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="G-XXXXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Adsense ID</label>
                                    <div className="relative">
                                        <Key size={18} className="absolute left-3 top-2.5 text-gray-400" />
                                        <input
                                            type="text"
                                            name="google_adsense_id"
                                            value={settings.google_adsense_id}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="ca-pub-XXXXXX"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Search Console</label>
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
                            </div>
                        </div>
                    )}

                    {/* Warning / Announcement Settings */}
                    {activeTab === 'warning' && (
                        <div className="space-y-6">
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
                                <p className="text-sm text-orange-700">
                                    Buradan site genelinde görünecek (en üstte şerit olarak) bir duyuru veya uyarı yayınlayabilirsiniz.
                                </p>
                            </div>

                            <div className="flex items-center space-x-3 mb-6">
                                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                    <input
                                        type="checkbox"
                                        name="site_warning_active"
                                        id="toggle-warning"
                                        checked={settings.site_warning_active === 'true'}
                                        onChange={handleChange}
                                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                    />
                                    <label htmlFor="toggle-warning" className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${settings.site_warning_active === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}></label>
                                </div>
                                <span className="font-medium text-gray-700">Duyuru Modunu Aktif Et</span>
                            </div>

                            {settings.site_warning_active === 'true' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Uyarı Tipi / Rengi</label>
                                        <div className="flex gap-4">
                                            {[
                                                { id: 'info', label: 'Bilgi (Mavi)', bg: 'bg-blue-100', text: 'text-blue-800' },
                                                { id: 'success', label: 'Başarılı (Yeşil)', bg: 'bg-green-100', text: 'text-green-800' },
                                                { id: 'warning', label: 'Dikkat (Sarı)', bg: 'bg-yellow-100', text: 'text-yellow-800' },
                                                { id: 'error', label: 'Hata (Kırmızı)', bg: 'bg-red-100', text: 'text-red-800' }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setSettings(prev => ({ ...prev, site_warning_type: type.id }))}
                                                    className={`px-4 py-2 rounded-lg border-2 transition-all ${settings.site_warning_type === type.id
                                                        ? 'border-black bg-gray-50'
                                                        : 'border-transparent hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${type.bg.replace('100', '500')}`}></span>
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Duyuru Metni</label>
                                        <textarea
                                            name="site_warning_text"
                                            value={settings.site_warning_text || ''}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            rows={2}
                                            placeholder="Duyuru metnini buraya giriniz..."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Social Media Settings */}
                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                                    <select
                                        value={newSocial.platform}
                                        onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    >
                                        {SOCIAL_PLATFORMS.map(platform => (
                                            <option key={platform.id} value={platform.id}>{platform.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">URL Linki</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            value={newSocial.url}
                                            onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={handleAddSocial}
                                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-6">
                                <h3 className="text-lg font-medium mb-4">Ekli Hesaplar</h3>
                                {socialLinks.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                                        Henüz sosyal medya hesabı eklenmemiş.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {socialLinks.map((link, index) => {
                                            const Icon = getIcon(link.platform);
                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                                            <Icon size={20} />
                                                        </div>
                                                        <div>
                                                            <span className="block font-medium capitalization">{SOCIAL_PLATFORMS.find(p => p.id === link.platform)?.name || link.platform}</span>
                                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate block max-w-[200px] md:max-w-md">
                                                                {link.url}
                                                            </a>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveSocial(index)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
