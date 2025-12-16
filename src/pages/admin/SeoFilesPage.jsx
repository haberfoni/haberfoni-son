import React, { useState, useEffect } from 'react';
import { FileText, Save, Download } from 'lucide-react';
import { adminService } from '../../services/adminService';

const SeoFilesPage = () => {
    const [files, setFiles] = useState({
        robots_txt: '',
        ads_txt: '',
        sitemap_xml: '',
        sitemap_news_xml: '',
        rss_xml: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('robots');

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            setLoading(true);
            const settings = await adminService.getSettings();

            // Generate all dynamic files
            const sitemap = await adminService.generateSitemap();
            const newsSitemap = await adminService.generateNewsSitemap();
            const rss = await adminService.generateRSS();

            setFiles({
                robots_txt: settings.robots_txt || `User-agent: *
Disallow: /admin/
Disallow: /panel/
Allow: /

# Google Bot Specific Rules
User-agent: Googlebot
Disallow: /admin/
Disallow: /panel/
Allow: /

# Sitemap
Sitemap: ${window.location.origin}/sitemap.xml
Sitemap: ${window.location.origin}/sitemap-news.xml
Sitemap: ${window.location.origin}/rss.xml`,
                ads_txt: settings.ads_txt || 'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0',
                sitemap_xml: sitemap,
                sitemap_news_xml: newsSitemap,
                rss_xml: rss
            });
        } catch (error) {
            console.error('Error loading SEO files:', error);
            setMessage({ type: 'error', text: 'Dosyalar yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminService.updateSettingsBulk([
                { key: 'robots_txt', value: files.robots_txt },
                { key: 'ads_txt', value: files.ads_txt }
                // sitemap is generated, not saved as setting usually, but we could if needed. 
                // For now, only robots and ads are editable/saveable settings.
            ]);
            setMessage({ type: 'success', text: 'Dosyalar kaydedildi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error saving files:', error);
            setMessage({ type: 'error', text: 'Kaydedilirken hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    const downloadFile = (filename, content) => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleRegenerate = async () => {
        setLoading(true);
        try {
            const sitemap = await adminService.generateSitemap();
            const newsSitemap = await adminService.generateNewsSitemap();
            const rss = await adminService.generateRSS();

            setFiles(prev => ({
                ...prev,
                sitemap_xml: sitemap,
                sitemap_news_xml: newsSitemap,
                rss_xml: rss
            }));

            setMessage({ type: 'success', text: 'Tüm dinamik dosyalar güncellendi.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error generating files:', error);
            setMessage({ type: 'error', text: 'Dosyalar oluşturulamadı.' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    const tabs = [
        { id: 'robots', label: 'robots.txt', filename: 'robots.txt' },
        { id: 'ads', label: 'ads.txt', filename: 'ads.txt' },
        { id: 'sitemap', label: 'sitemap.xml', filename: 'sitemap.xml' },
        { id: 'news_sitemap', label: 'sitemap-news.xml', filename: 'sitemap-news.xml' },
        { id: 'rss', label: 'rss.xml', filename: 'rss.xml' },
    ];

    const getFileContent = (tabId) => {
        switch (tabId) {
            case 'robots': return files.robots_txt;
            case 'ads': return files.ads_txt;
            case 'sitemap': return files.sitemap_xml;
            case 'news_sitemap': return files.sitemap_news_xml;
            case 'rss': return files.rss_xml;
            default: return '';
        }
    };

    const isDynamic = ['sitemap', 'news_sitemap', 'rss'].includes(activeTab);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">SEO Dosyaları</h1>
                    <p className="text-gray-500">Sitemap, RSS ve robot yapılandırması.</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => downloadFile(
                            tabs.find(t => t.id === activeTab).filename,
                            getFileContent(activeTab)
                        )}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download size={18} />
                        <span className="hidden md:inline">İndir</span>
                    </button>

                    {isDynamic ? (
                        <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <FileText size={18} />
                            <span>Tümünü Yenile</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center space-x-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            <Save size={18} />
                            <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                        </button>
                    )}
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 px-4 py-4 text-xs md:text-sm font-medium transition-colors border-b-2 whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-primary text-primary bg-white'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <FileText size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-0">
                    <textarea
                        value={getFileContent(activeTab)}
                        onChange={(e) => {
                            if (isDynamic) return;
                            setFiles(prev => ({
                                ...prev,
                                [activeTab === 'robots' ? 'robots_txt' : 'ads_txt']: e.target.value
                            }))
                        }}
                        readOnly={isDynamic}
                        className={`w-full h-[500px] p-6 font-mono text-xs md:text-sm focus:outline-none resize-none ${isDynamic ? 'bg-gray-50' : ''}`}
                        spellCheck="false"
                    />
                </div>

                {isDynamic ? (
                    <div className="bg-blue-50 p-4 border-t border-blue-100 text-sm text-blue-800">
                        <strong className="block mb-1">Otomatik Üretilen İçerik</strong>
                        Bu dosya veritabanındaki içeriklere göre otomatik oluşturulur. Canlı olarak <a href={`/${tabs.find(t => t.id === activeTab).filename}`} target="_blank" rel="noopener noreferrer" className="underline font-bold">buradan</a> görüntüleyebilirsiniz.
                    </div>
                ) : (
                    <div className="bg-orange-50 p-4 border-t border-orange-100 text-sm text-orange-800 flex items-start space-x-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <strong className="block mb-1 font-bold">Önemli Teknik Bilgi:</strong>
                            robots.txt ve ads.txt dosyaları için, burada yaptığınız değişikliklerin arama motorlarına yansıması için Hosting panelinizden ilgili dosyaları güncellemeniz gerekebilir. (Sadece veritabanı ayarı güncellenir)
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeoFilesPage;
