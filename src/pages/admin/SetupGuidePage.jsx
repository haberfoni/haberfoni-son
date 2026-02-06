import React, { useState, useEffect } from 'react';
import { supabaseUrl, supabaseKey } from '../../services/supabase';
import { BookOpen, Terminal, Database, Server, Settings, Globe, Download, Copy, Check } from 'lucide-react';

const SetupGuidePage = () => {
    const [copied, setCopied] = useState(false);
    const [sqlContent, setSqlContent] = useState('');

    useEffect(() => {
        // Fetch the actual SQL content to display in the preview
        fetch('/sitekurulum.sql')
            .then(res => res.text())
            .then(text => setSqlContent(text))
            .catch(err => console.error('SQL yüklenemedi:', err));
    }, []);

    // Config UI State
    const [configUrl, setConfigUrl] = useState(supabaseUrl || '');
    const [configKey, setConfigKey] = useState(supabaseKey || '');

    const handleCopy = () => {
        if (sqlContent) {
            navigator.clipboard.writeText(sqlContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUpdateConfig = () => {
        if (!configUrl || !configKey) {
            alert('Lütfen hem URL hem de Key alanlarını doldurun.');
            return;
        }

        const newConfig = {
            API_URL: configUrl,
            API_KEY: configKey,
            VITE_SUPABASE_URL: configUrl,
            VITE_SUPABASE_ANON_KEY: configKey
        };

        localStorage.setItem('CUSTOM_APP_CONFIG', JSON.stringify(newConfig));
        alert('Ayarlar kaydedildi! Sayfa yenileniyor...');
        window.location.reload();
    };

    const handleResetConfig = () => {
        if (confirm('Özel ayarları silip varsayılan config.js dosyasına dönmek istediğinize emin misiniz?')) {
            localStorage.removeItem('CUSTOM_APP_CONFIG');
            window.location.reload();
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center mb-8 border-b pb-4">
                <BookOpen className="mr-3 text-primary" size={32} />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sistem Kurulum Rehberi</h1>
                    <p className="text-gray-500 text-sm">Adım adım siteyi yayına alma ve taşıma kılavuzu.</p>
                </div>
            </div>

            <div className="space-y-8">



                {/* ADIM 0: BAĞLANTI AYARLARI (Panelden Düzenleme) */}
                <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 relative overflow-hidden ring-1 ring-purple-100">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Settings className="mr-3 text-purple-600" size={24} />
                        Bağlantı Ayarları (Panelden Düzenle)
                    </h2>

                    <div className="ml-0 pl-4 md:ml-0 md:pl-0">
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6 text-sm text-purple-900">
                            <strong>Dikkat:</strong> Buradan yapacağınız değişiklikler <u>sadece sizin tarayıcınızda</u> (bu bilgisayarda) geçerli olur.
                            Yönetim paneline buradan erişip siteyi yönetmeye devam edebilirsiniz.
                            <br /><br />
                            Siteye giren herkesin (ziyaretçilerin) yeni veritabanını görmesi için aşağıda (3. Adım) anlatılan <code>config.js</code> dosyasını güncellemeniz gerekir.
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
                                <input
                                    type="text"
                                    value={configUrl}
                                    onChange={(e) => setConfigUrl(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Supabase Anon Key</label>
                                <input
                                    type="password"
                                    value={configKey}
                                    onChange={(e) => setConfigKey(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                                    placeholder="eyJ..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleUpdateConfig}
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors shadow-sm text-sm font-medium"
                            >
                                Ayarları Kaydet ve Bağlan
                            </button>
                            <button
                                onClick={handleResetConfig}
                                className="bg-white text-gray-600 px-4 py-2 rounded hover:bg-gray-50 border border-gray-300 transition-colors shadow-sm text-sm font-medium"
                            >
                                Varsayılanlara Dön (Sıfırla)
                            </button>
                        </div>
                    </div>
                </div>

                {/* ADIM 1: GEREKSİNİMLER */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                        Neye İhtiyacınız Var?
                    </h2>
                    <ul className="space-y-3 ml-11">
                        <li className="flex items-start">
                            <Server className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                                <strong className="text-gray-800">Bir Hosting (Sunucu) Alanı:</strong>
                                <p className="text-sm text-gray-600">Site dosyalarını yükleyeceğiniz yer. (Örn: cPanel, Plesk, netlify, vercel vb.)</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <Database className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                                <strong className="text-gray-800">Bir Veritabanı Servisi:</strong>
                                <p className="text-sm text-gray-600">
                                    Verilerin (haberler, kullanıcılar) duracağı yer. Sistem <strong>PostgreSQL</strong> kullanır.
                                    <br />
                                    <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mt-1 inline-block">
                                        Not: Proje Supabase altyapısına göre hazırlanmıştır ancak PostgreSQL destekleyen farklı servislerle de çalışabilir (API uyumluluğu gerektirir). En kolayı ücretsiz <strong>Supabase</strong> hesabı açmaktır.
                                    </span>
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* ADIM 2: VERİTABANI KURULUMU */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                        Veritabanını Hazırlama (Tabloları Oluşturma)
                    </h2>

                    <div className="ml-11">
                        <p className="text-gray-600 mb-4">
                            Sitenin çalışması için veritabanında "Haberler", "Kategoriler" gibi tabloların olması gerekir. Bunu tek tıkla yapmak için hazırladığımız dosyayı kullanın.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-2">Yöntem A: Dosyayı İndir</h3>
                                <p className="text-sm text-gray-600 mb-3">Bu dosyayı indirip veritabanı panelinizdeki (Supabase SQL Editor) "Upload" veya "Run" kısmından çalıştırın.</p>
                                <a
                                    href="/sitekurulum.sql"
                                    download="sitekurulum.sql"
                                    className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors w-full"
                                >
                                    <Download size={18} />
                                    <span>SQL Dosyasını İndir</span>
                                </a>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="font-bold text-gray-800 mb-2">Yöntem B: Kodu Kopyala</h3>
                                <p className="text-sm text-gray-600 mb-3">Aşağıdaki kodun tamamını kopyalayıp veritabanı SQL editörüne yapıştırıp çalıştırın.</p>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded transition-colors w-full border ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                    <span>{copied ? 'Kopyalandı!' : 'Kodu Kopyala'}</span>
                                </button>
                            </div>
                        </div>

                        {/* SQL Preview */}
                        <div className="relative group">
                            <div className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-50">Önizleme</div>
                            <textarea
                                readOnly
                                value={sqlContent || '-- SQL dosyası yükleniyor...'}
                                className="w-full h-48 bg-gray-900 text-gray-300 text-xs font-mono p-4 rounded-lg outline-none resize-y"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2 text-center">Bu kod veritabanınızı otomatik olarak kurar.</p>
                        </div>
                    </div>
                </div>

                {/* ADIM 3: BAĞLANTI AYARLARI */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                        Siteyi Veritabanına Bağlama
                    </h2>

                    <div className="ml-11">
                        <p className="text-gray-600 mb-4">
                            İndirdiğiniz site dosyalarının içinde <code>config.js</code> adında bir dosya vardır. Bu dosyayı Not Defteri ile açıp veritabanı bilgilerinizi girmelisiniz.
                        </p>

                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg font-mono text-sm text-gray-800 overflow-x-auto">
                            <span className="text-gray-500">// config.js dosyası</span><br />
                            <span className="text-purple-600">window</span>.<span className="text-blue-600">APP_CONFIG</span> = {'{'}<br />
                            &nbsp;&nbsp;<span className="text-green-700">API_URL</span>: <span className="text-red-600">"{supabaseUrl || "https://sizin-proje-adresiniz.supabase.co"}"</span>,<br />
                            &nbsp;&nbsp;<span className="text-green-700">API_KEY</span>: <span className="text-red-600">"{supabaseKey || "KEY_BURAYA"}"</span> <span className="text-gray-500">{'// Anon Key buraya'}</span><br />
                            {'};'}
                        </div>

                        <p className="text-sm text-gray-500 mt-3">
                            * Bu bilgileri kullandığınız veritabanı servisinin (örn: Supabase) ayarlar sayfasından ("Project Settings" &rarr; "API") bulabilirsiniz.
                        </p>
                    </div>
                </div>

                {/* ADIM 4: DOMAIN / HOSTING TAŞIMA */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gray-600"></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Globe className="mr-3 text-gray-600" size={24} />
                        Siteyi Başka Bir Adrese Taşıma (Domain Değiştirme)
                    </h2>

                    <div className="ml-11 space-y-4">
                        <p className="text-gray-700 font-medium">
                            Sitenizi <code>eskisite.com</code>'dan <code>yenisite.com</code>'a taşırken yapmanız gerekenler:
                        </p>

                        <div className="bg-white p-4 rounded border border-gray-200 flex gap-4">
                            <div className="flex-shrink-0 bg-gray-200 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mt-1">1</div>
                            <div>
                                <h4 className="font-bold text-gray-800">Dosyaları Taşıyın</h4>
                                <p className="text-sm text-gray-600">Tüm dosyaları yeni hostinginize kopyalayın. Kod değişikliği gerekmez.</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded border border-gray-200 flex gap-4">
                            <div className="flex-shrink-0 bg-gray-200 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mt-1">2</div>
                            <div>
                                <h4 className="font-bold text-gray-800">Veritabanı İzni (Çok Önemli)</h4>
                                <p className="text-sm text-gray-600 mb-2">
                                    Veritabanı servisiniz (Supabase vb.), güvenlik nedeniyle sadece izin verilen sitelerden gelen girişleri kabul eder. Yeni adresinizi eklemezseniz <strong>Admin paneline giremezsiniz.</strong>
                                </p>
                                <ul className="list-disc list-inside text-xs text-gray-500 ml-1">
                                    <li>Supabase Paneli &rarr; Authentication &rarr; URL Configuration</li>
                                    <li>Site URL: <code>https://yenisite.com</code></li>
                                    <li>Redirect URLs: <code>https://yenisite.com/**</code> ekleyin.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    );
};

export default SetupGuidePage;
