import React from 'react';
import SEO from '../components/SEO';

const ImprintPage = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <SEO
                title="Künye"
                description="Haberfoni künye bilgileri. İmtiyaz sahibi, genel yayın yönetmeni ve iletişim bilgileri."
                url="/kunye"
            />
            <h1 className="text-4xl font-bold mb-10 text-center">Künye</h1>

            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">İmtiyaz Sahibi</h2>
                        <p className="font-semibold text-xl">Haberfoni Medya A.Ş.</p>
                        <p className="text-gray-600 mt-1">Adına: Ahmet Yılmaz</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">Genel Yayın Yönetmeni</h2>
                        <p className="font-semibold text-lg">Ahmet Yılmaz</p>
                        <p className="text-gray-500 text-sm">ahmet@haberportalim.com</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">Hukuk Danışmanı</h2>
                        <p className="font-semibold text-lg">Av. Mehmet Öz</p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">Sorumlu Yazı İşleri</h2>
                        <p className="font-semibold text-lg">Ayşe Demir</p>
                        <p className="text-gray-500 text-sm">ayse@haberportalim.com</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">İletişim & Adres</h2>
                        <p className="font-medium mb-2">Maslak Mah. Büyükdere Cad. No:123</p>
                        <p className="font-medium mb-4">Sarıyer / İstanbul</p>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-semibold">Tel:</span> +90 212 123 45 67</p>
                            <p><span className="font-semibold">E-posta:</span> info@haberportalim.com</p>
                            <p><span className="font-semibold">KEP:</span> haberportalim@hs01.kep.tr</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="max-w-4xl mx-auto mt-12 bg-gray-50 p-8 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Yasal Uyarı</h3>
                <p>
                    Haberfoni web sitesinde yayınlanan haber, yazı, resim ve fotoğrafların Fikir ve Sanat Eserleri Kanunu gereğince izin alınmadan, kaynak gösterilerek dahi iktibas edilmesi yasaktır. Sitede yer alan köşe yazılarının sorumluluğu yazarlarına aittir.
                </p>
                <p className="mt-2">
                    Haberfoni, basın meslek ilkelerine uymaya söz vermiştir.
                </p>
            </div>
        </div>
    );
};

export default ImprintPage;
