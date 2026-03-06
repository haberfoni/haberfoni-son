import React from 'react';
import { BookOpen, Terminal, Database, Server, Settings, Globe, Code, Key, ChevronRight, AlertCircle, Download } from 'lucide-react';

const SetupGuidePage = () => {
    const steps = [
        {
            icon: <Download className="text-blue-500" />,
            title: "1. Hazırlık ve Kurulum",
            content: (
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">Projenin çalışması için sunucunuzda <strong>Node.js (v18+)</strong> ve <strong>MySQL</strong> (veya SQLite) kurulu olmalıdır.</p>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-blue-300">
                        <p># Bağımlılıkları yükleyin</p>
                        <p>npm install</p>
                        <p className="mt-2 text-gray-400"># Backend dizinine gidin ve yükleyin</p>
                        <p>cd backend && npm install</p>
                    </div>
                </div>
            )
        },
        {
            icon: <Settings className="text-orange-500" />,
            title: "2. Ortam Değişkenleri (.env)",
            content: (
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">Proje kök dizinindeki ve <code>backend/</code> dizinindeki <code>.env</code> dosyalarını düzenleyin:</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono">
                        <p className="text-blue-600"># backend/.env</p>
                        <p>DATABASE_URL="mysql://user:pass@localhost:3306/dbname"</p>
                        <p>JWT_SECRET="guclu-bir-anahtar"</p>
                        <p className="mt-2 text-blue-600"># /.env (Frontend)</p>
                        <p>VITE_API_URL="http://localhost:5000"</p>
                    </div>
                </div>
            )
        },
        {
            icon: <Database className="text-green-500" />,
            title: "3. Veritabanı Yapılandırması",
            content: (
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">Prisma şemasını veritabanınıza uygulayın:</p>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-300">
                        <p>cd backend</p>
                        <p>npx prisma db push</p>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800">
                        <AlertCircle size={14} />
                        <span>Not: Mevcut verileriniz varsa "db push" yerine migrate kullanılması önerilir.</span>
                    </div>
                </div>
            )
        },
        {
            icon: <Globe className="text-purple-500" />,
            title: "4. Paneli Yapılandırma",
            content: (
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">Site yayına girdikten sonra şu ayarları panelden (Ayarlar sekmesi) yapabilirsiniz:</p>
                    <ul className="text-xs text-gray-600 space-y-2 list-disc ml-5">
                        <li><strong>Site Title & SEO:</strong> Genel ayarlar kısmından başlık ve açıklamaları güncelleyin.</li>
                        <li><strong>Gemini AI:</strong> Yapay zeka ile haber rewriting için "SEO & API" sekmesinden API Key girin.</li>
                        <li><strong>Bot Bot Mappings:</strong> "Haber Botu Ayarları" kısmından hangi kaynaktan hangi kategoriye haber çekileceğini belirleyin.</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center mb-8 border-b pb-4">
                <BookOpen className="mr-3 text-primary" size={32} />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sistem Kurulum & Taşıma Rehberi</h1>
                    <p className="text-gray-500 text-sm">Siteyi başka bir sunucuya taşımak veya sıfırdan kurmak için izlenmesi gereken adımlar.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-600 mb-4">
                        <Server size={20} />
                        <h3 className="font-bold">Backend Mimarisi</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Sistem **NestJS** üzerinde kurulu, tamamen kendi sunucunuzda çalışan bir API yapısına sahiptir. Prisma ORM sayesinde MySQL veya PostgreSQL ile tam uyumludur.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 text-green-600 mb-4">
                        <Terminal size={20} />
                        <h3 className="font-bold">Hızlı Başlatma</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Tüm modüller bağımsızdır. `run_all.bat` dosyası ile hem frontend hem backend aynı anda başlatılabilir (Windows). Linux için `pm2` önerilir.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {steps.map((step, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                {React.cloneElement(step.icon, { size: 20 })}
                            </div>
                            <h2 className="font-bold text-gray-800">{step.title}</h2>
                        </div>
                        <div className="p-6">
                            {step.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-gray-900 rounded-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-10 rounded-full -mr-32 -mt-32"></div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Code size={24} className="text-primary" />
                    Profesyonel Destek
                </h3>
                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                    Sistemin taşınması, kurulumu veya özel geliştirme talepleriniz için teknik dokümantasyonu inceleyebilir veya geliştirici ile iletişime geçebilirsiniz.
                </p>
                <div className="flex gap-4">
                    <button className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                        <span>README.md'ye Git</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupGuidePage;
