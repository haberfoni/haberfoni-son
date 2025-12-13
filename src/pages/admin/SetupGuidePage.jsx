import React from 'react';
import { BookOpen, Terminal, Database, Server, Settings, Shield } from 'lucide-react';

const SetupGuidePage = () => {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center mb-8">
                <BookOpen className="mr-3 text-primary" size={24} />
                <h1 className="text-2xl font-bold text-gray-800">Sistem Kurulum ve Çalıştırma Rehberi</h1>
            </div>

            <div className="space-y-6">
                {/* 1. Gereksinimler */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Settings className="mr-2 text-blue-500" size={20} />
                        1. Gereksinimler
                    </h2>
                    <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                        <li><strong>Hosting Hesabı:</strong> Dosyaları yüklemek için (cPanel, Plesk veya FTP erişimi).</li>
                        <li><strong>Veritabanı Servisi:</strong> Verilerin saklanması için PostgreSQL veritabanı.</li>
                        <li><strong>Alan Adı (Domain):</strong> Sitenizin yayınlanacağı adres.</li>
                    </ul>
                </div>

                {/* 2. Kurulum ve Hazırlık */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Terminal className="mr-2 text-green-500" size={20} />
                        2. Kurulum (Dosyaları Yükleme & Bağlantı)
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Site dosyalarınızı sunucuya yükledikten sonra, sitenin veri tabanı ile iletişim kurabilmesi için küçük bir ayar yapılması gerekir.
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Adım 1: Bağlantı Dosyasını Düzenleme</h3>
                        <p className="text-sm text-gray-600 mb-2">
                            Sunucunuzdaki <code>config.js</code> dosyasını açın.
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-3">
                            <li><strong>API_URL:</strong> Veritabanı Sunucu Adresi</li>
                            <li><strong>API_KEY:</strong> Bağlantı Anahtarı</li>
                        </ul>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm">
                            window.APP_CONFIG = &#123;<br />
                            &nbsp;&nbsp;API_URL: "https://....",<br />
                            &nbsp;&nbsp;API_KEY: "ey..."<br />
                            &#125;;
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            *Bu bilgileri sistem yöneticinizden veya veritabanı panelinden temin edebilirsiniz.
                        </p>
                    </div>
                </div>

                {/* 3. Veritabanı Kurulumu */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Database className="mr-2 text-orange-500" size={20} />
                        3. Veritabanı Hazırlığı (SQL)
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Sitenin çalışabilmesi için gerekli tablo yapısının veritabanına yüklenmesi gerekir.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">Kurulum Adımları</h3>
                        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2">
                            <li>Veritabanı yönetim panelinizi açın ve <strong>SQL Editor</strong> kısmına gelin.</li>
                            <li>
                                Aşağıdaki butona tıklayarak <strong><code>sitekurulum.sql</code></strong> dosyasını indirin:
                                <div className="mt-2 text-center sm:text-left">
                                    <a
                                        href="/sitekurulum.sql"
                                        download="sitekurulum.sql"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        <Database size={16} />
                                        sitekurulum.sql İndir
                                    </a>
                                </div>
                            </li>
                            <li className="mt-2 text-gray-600">
                                İndirdiğiniz dosyayı <strong>Not Defteri (Notepad)</strong> veya herhangi bir metin editörü ile açın.
                            </li>
                            <li>Tüm içeriği kopyalayıp veritabanı editörüne yapıştırın ve <strong>Çalıştır (Run)</strong> butonuna basın.</li>
                        </ol>

                        <details className="mt-4 border-t border-blue-200 pt-3">
                            <summary className="text-blue-700 text-sm font-medium cursor-pointer hover:text-blue-800 focus:outline-none">
                                Veya SQL kodunu buradan görüntüleyin/kopyalayın
                            </summary>
                            <div className="mt-2 relative">
                                <textarea
                                    className="w-full h-48 p-3 text-xs font-mono bg-white border border-blue-200 rounded text-gray-600 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-y"
                                    readOnly
                                    value={`-- ==========================================
-- HABERFONI MASTER SETUP SCRIPT
-- ==========================================
-- Veritabanı tablolarını otomatik oluşturur
-- Lütfen bu kodun tamamını kopyalayıp çalıştırın.

-- Profiles, News, Categories, Photo Galleries, Videos, etc...
-- (Tam dosya içeriği için yukarıdaki İndir butonunu kullanın)`}
                                    onClick={(e) => e.target.select()}
                                />
                                <div className="absolute top-2 right-2 text-xs text-gray-400 pointer-events-none bg-white/80 px-1 rounded">
                                    Salt Okunur
                                </div>
                            </div>
                        </details>

                        <p className="text-xs text-blue-600 mt-2 mt-3">
                            Bu işlem; Haberler, Kategoriler, Kullanıcılar gibi tüm gerekli tabloları otomatik oluşturur.
                        </p>
                    </div>
                </div>

                {/* 4. Yayına Alma */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <Server className="mr-2 text-purple-500" size={20} />
                        4. Yayına Alma (Tamamlandı)
                    </h2>
                    <p className="text-gray-600">
                        Dosyaları yükleyip <code>config.js</code> ayarını yaptıktan sonra siteniz yayındadır.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SetupGuidePage;
