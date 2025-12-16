import React, { useState, useEffect } from 'react';
import { Mail, Save, Key, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';

const EmailSettingsPage = () => {
    const [settings, setSettings] = useState({
        api_key: '',
        from_email: '',
        service: 'resend'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await adminService.getEmailSettings();
            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings.api_key || !settings.from_email) {
            setMessage({ type: 'error', text: 'Lütfen tüm alanları doldurun.' });
            return;
        }

        setSaving(true);
        try {
            await adminService.updateEmailSettings({
                api_key: settings.api_key,
                from_email: settings.from_email,
                service: settings.service
            });

            setMessage({ type: 'success', text: 'Email ayarları kaydedildi!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: 'Kaydetme hatası: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                    <Mail className="text-primary" />
                    <span>Email Ayarları</span>
                </h1>
                <p className="text-gray-500">Bülten gönderimi için email servisi ayarları</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
                    {message.text}
                </div>
            )}

            {/* Settings Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Resend API Ayarları</h2>

                    {/* API Key */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            API Key
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="password"
                                value={settings.api_key}
                                onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="re_xxxxxxxxxxxxx"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Resend API key'inizi buraya yapıştırın.
                            <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                API key almak için tıklayın
                            </a>
                        </p>
                    </div>

                    {/* From Email */}
                    <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Gönderen Email Adresi
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                value={settings.from_email}
                                onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="bulten@haberfoni.com"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Bültenlerinizin gönderileceği email adresi. Resend'e kayıt olduğunuz email adresini kullanın.
                        </p>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Ayarları Kaydet
                            </>
                        )}
                    </button>
                </div>
            </div>



            {/* Domain Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-yellow-900 flex items-center gap-2">
                    ⚠️ Önemli: Domain Doğrulaması
                </h3>
                <div className="text-sm text-yellow-800 space-y-3">
                    <p><strong>Gmail, Hotmail, Yahoo gibi public email adreslerinden mail gönderemezsiniz!</strong></p>



                    <div className="bg-white rounded-lg p-4 border border-yellow-300">
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li><a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Resend Domains</a> sayfasına gidin</li>
                            <li>Domaininizi ekleyin</li>
                            <li>Resend size DNS kayıtları (TXT, MX, CNAME) verecek - bunları domain sağlayıcınızın (GoDaddy, Namecheap vb.) DNS yönetim panelinden ekleyin</li>
                            <li>Doğrulama tamamlandıktan sonra kayıtlı mail adresiniz üzerinden bülten gönderimine başlayabilirsiniz (örn: <code className="bg-yellow-100 px-2 py-1 rounded">bulten@domaininiz.com</code> gibi)</li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Key size={18} />
                    Resend API Key Nasıl Alınır?
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li><a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline text-primary">resend.com</a> adresine gidin ve ücretsiz hesap oluşturun</li>
                    <li>Dashboard'da "API Keys" bölümüne gidin</li>
                    <li>"Create API Key" butonuna tıklayın</li>
                    <li><strong>Permission:</strong> "Full Access" seçin (Sending access yeterli değil!)</li>
                    <li>Oluşan key'i kopyalayın ve yukarıdaki alana yapıştırın</li>
                </ol>
            </div>
        </div>
    );
};

export default EmailSettingsPage;
