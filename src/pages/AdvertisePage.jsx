import React from 'react';
import { BarChart, Users, MousePointer, Download, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const AdvertisePage = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <SEO
                title="Reklam"
                description="Haberfoni reklam çözümleri. Markanızı milyonlarla buluşturun."
                url="/reklam"
            />
            {/* Hero */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-6">Haberfoni'de Reklam</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Markanızı Türkiye'nin en hızlı büyüyen haber platformunda milyonlarla buluşturun.
                    Etkili reklam çözümlerimizle hedef kitlenize doğrudan ulaşın.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="bg-primary/5 p-8 rounded-xl text-center border border-primary/10">
                    <div className="text-primary mb-4 flex justify-center"><Users size={40} /></div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">5M+</div>
                    <div className="text-gray-600 font-medium">Aylık Ziyaretçi</div>
                </div>
                <div className="bg-primary/5 p-8 rounded-xl text-center border border-primary/10">
                    <div className="text-primary mb-4 flex justify-center"><MousePointer size={40} /></div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">12M+</div>
                    <div className="text-gray-600 font-medium">Sayfa Görüntüleme</div>
                </div>
                <div className="bg-primary/5 p-8 rounded-xl text-center border border-primary/10">
                    <div className="text-primary mb-4 flex justify-center"><BarChart size={40} /></div>
                    <div className="text-4xl font-bold text-gray-900 mb-2">4.5dk</div>
                    <div className="text-gray-600 font-medium">Ortalama Kalış Süresi</div>
                </div>
            </div>

            {/* Ad Models */}
            <div className="mb-20">
                <h2 className="text-3xl font-bold text-center mb-12">Reklam Modellerimiz</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Display Ads Visual */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="bg-gray-50 h-48 p-4 relative flex flex-col gap-2">
                            {/* Header Ad */}
                            <div className="h-8 w-full bg-primary/20 border border-primary/40 rounded flex items-center justify-center text-[10px] font-bold text-primary mb-1">
                                970x250 Masthead
                            </div>
                            <div className="flex gap-2 flex-1">
                                {/* Content Area */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="h-2 w-full bg-gray-200 rounded"></div>
                                    <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                                    <div className="h-2 w-full bg-gray-200 rounded"></div>
                                    <div className="h-2 w-5/6 bg-gray-200 rounded"></div>
                                    <div className="h-20 w-full bg-gray-200 rounded mt-auto"></div>
                                </div>
                                {/* Sidebar Ads */}
                                <div className="w-1/3 flex flex-col gap-2">
                                    <div className="h-16 w-full bg-primary/20 border border-primary/40 rounded flex items-center justify-center text-[10px] font-bold text-primary text-center">
                                        300x250<br />Sidebar
                                    </div>
                                    <div className="h-full w-full bg-primary/20 border border-primary/40 rounded flex items-center justify-center text-[10px] font-bold text-primary text-center">
                                        300x600<br />Sticky
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-3">Display Reklamlar</h3>
                            <p className="text-gray-600 mb-4">
                                Ana sayfa, kategori sayfaları ve haber detaylarında yüksek görünürlüklü banner alanları.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li>• 970x250 Masthead</li>
                                <li>• 300x250 Sidebar</li>
                                <li>• 300x600 Sticky</li>
                            </ul>
                        </div>
                    </div>

                    {/* Advertorial Visual */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="bg-gray-50 h-48 p-4 flex items-center justify-center">
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 w-full max-w-[240px]">
                                <div className="h-24 bg-gray-200 rounded-md mb-3 relative overflow-hidden">
                                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">
                                        SPONSORLU
                                    </div>
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Users size={24} />
                                    </div>
                                </div>
                                <div className="h-3 w-full bg-gray-800 rounded mb-2"></div>
                                <div className="h-2 w-2/3 bg-gray-300 rounded"></div>
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-3">Sponsorlu İçerik</h3>
                            <p className="text-gray-600 mb-4">
                                Markanızın hikayesini haber formatında okuyucularımıza aktarın. SEO uyumlu ve kalıcı içerikler.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li>• Özel Röportajlar</li>
                                <li>• Ürün İncelemeleri</li>
                                <li>• Basın Bültenleri</li>
                            </ul>
                        </div>
                    </div>

                    {/* Video Visual */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="bg-gray-50 h-48 p-4 flex flex-col justify-center gap-2">
                            <div className="h-2 w-full bg-gray-200 rounded"></div>
                            <div className="h-2 w-5/6 bg-gray-200 rounded"></div>
                            <div className="h-24 w-full bg-black/90 rounded-lg flex items-center justify-center relative my-1 group-hover:scale-[1.02] transition-transform">
                                <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center text-white pl-1 shadow-lg">
                                    <Play size={20} fill="currentColor" />
                                </div>
                                <div className="absolute bottom-2 left-2 text-[10px] text-white/80 bg-black/50 px-1.5 rounded">
                                    Reklam • 0:15
                                </div>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded"></div>
                            <div className="h-2 w-4/5 bg-gray-200 rounded"></div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-3">Video & Native</h3>
                            <p className="text-gray-600 mb-4">
                                Haber akışı içinde doğal görünümlü video ve native reklam yerleşimleri.
                            </p>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li>• Pre-roll Video</li>
                                <li>• In-read Video</li>
                                <li>• Native Grid</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-gray-900 text-white rounded-2xl p-12 text-center">
                <h2 className="text-3xl font-bold mb-6">Hemen İletişime Geçin</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                    Markanıza özel reklam stratejileri ve fiyat teklifi almak için reklam ekibimizle görüşün.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/iletisim?subject=Reklam" className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center">
                        Teklif İste
                    </Link>
                    <a
                        href="/medya-kiti.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-transparent border border-white hover:bg-white/10 text-white font-bold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={20} />
                        Medya Kitini Görüntüle
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AdvertisePage;
