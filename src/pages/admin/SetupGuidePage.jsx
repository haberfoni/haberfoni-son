import React, { useState, useEffect } from 'react';
import { BookOpen, Terminal, Database, Server, Settings, Globe, Download, Copy, Check } from 'lucide-react';

const SetupGuidePage = () => {
    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center mb-8 border-b pb-4">
                <BookOpen className="mr-3 text-primary" size={32} />
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Sistem Kurulum Rehberi</h1>
                    <p className="text-gray-500 text-sm">Adım adım siteyi yayına alma kılavuzu.</p>
                </div>
            </div>

            <div className="space-y-8">

                {/* ADIM 1: GEREKSİNİMLER */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                        Sistem Mimarisi
                    </h2>
                    <ul className="space-y-3 ml-11">
                        <li className="flex items-start">
                            <Server className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                                <strong className="text-gray-800">Node.js Backend (NestJS):</strong>
                                <p className="text-sm text-gray-600">Projeniz gücünü tamamen kendi sunucunuzda çalışan NestJS API servislerinden almaktadır. Dışa bağımlı veritabanı platformlarına (örn. Supabase) gerek kalmamıştır.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <Database className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                            <div>
                                <strong className="text-gray-800">Kendi Veritabanınız:</strong>
                                <p className="text-sm text-gray-600">
                                    Sunucunuzdaki yerleşik SQLite veya MySQL kullanılarak dışa bağımsız bir veritabanı yönetimi sağlanmaktadır.
                                </p>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* ADIM 2: BİLGİLENDİRME */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Globe className="mr-3 text-gray-600" size={24} />
                        Kullanıma Hazır
                    </h2>

                    <div className="ml-11 space-y-4">
                        <p className="text-gray-700 font-medium">
                            Siteniz şu anda tamamen çalışır durumdadır. Herhangi bir ekstra API Key veya Panel bağlamanıza gerek yoktur.
                        </p>

                        <div className="bg-white p-4 rounded border border-gray-200">
                            <p className="text-sm text-gray-600">Backend API URL: <strong className="text-green-600">VITE_API_URL</strong> değişkeninden otomatik çekilir.</p>
                            <p className="text-sm text-gray-600 mt-2">Dış servislere olan tüm eski bağlantılar kaldırılarak sistem tamamen özgür ve hızlı hale getirilmiştir.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    );
};

export default SetupGuidePage;
