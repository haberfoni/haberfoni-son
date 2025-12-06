import React, { useState, useEffect } from 'react';
import { FileText, Save, Download } from 'lucide-react';
import { adminService } from '../../services/adminService';

const SeoFilesPage = () => {
    const [files, setFiles] = useState({
        robots_txt: '',
        ads_txt: ''
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
            setFiles({
                robots_txt: settings.robots_txt || 'User-agent: *\nAllow: /',
                ads_txt: settings.ads_txt || 'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0'
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

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    const tabs = [
        { id: 'robots', label: 'robots.txt', filename: 'robots.txt' },
        { id: 'ads', label: 'ads.txt', filename: 'ads.txt' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">SEO Dosyaları</h1>
                    <p className="text-gray-500">Arama motorları ve reklam ağları için kök dosyalar.</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => downloadFile(activeTab === 'robots' ? 'robots.txt' : 'ads.txt', activeTab === 'robots' ? files.robots_txt : files.ads_txt)}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download size={18} />
                        <span className="hidden md:inline">İndir</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center space-x-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                            <FileText size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-0">
                    <textarea
                        value={activeTab === 'robots' ? files.robots_txt : files.ads_txt}
                        onChange={(e) => setFiles(prev => ({
                            ...prev,
                            [activeTab === 'robots' ? 'robots_txt' : 'ads_txt']: e.target.value
                        }))}
                        className="w-full h-[500px] p-6 font-mono text-sm focus:outline-none resize-none"
                        spellCheck="false"
                    />
                </div>

                <div className="bg-yellow-50 p-4 border-t border-yellow-100 text-xs text-yellow-800">
                    <strong>Önemli Not:</strong> Değişiklikleri kaydettikten sonra <span className="font-bold">İndir</span> butonunu kullanarak dosyayı bilgisayarınıza indirin ve FTP/Hosting panelinizden sitenizin anadizinine (public_html) yükleyin. Bu işlem otomatik yapılamaz.
                </div>
            </div>
        </div>
    );
};

export default SeoFilesPage;
