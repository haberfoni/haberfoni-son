import React from 'react';
import { Users, Target, Award } from 'lucide-react';
import SEO from '../components/SEO';

const AboutPage = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <SEO
                title="Hakkımızda"
                description="Haberfoni hakkında bilgi alın. Misyonumuz, vizyonumuz ve ekibimizle tanışın."
                url="/hakkimizda"
            />
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Hakkımızda</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Haberfoni, 2025 yılında kurulmuş, tarafsız ve doğru habercilik ilkesiyle yayın yapan Türkiye'nin yeni nesil haber platformudur.
                </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <Target size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Misyonumuz</h3>
                    <p className="text-gray-600">
                        Okuyucularımıza en güncel haberleri, en hızlı ve en doğru şekilde, tarafsızlık ilkesinden ödün vermeden ulaştırmak.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <Users size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Vizyonumuz</h3>
                    <p className="text-gray-600">
                        Dijital habercilikte güvenilirliğin ve kalitenin adresi olarak, Türkiye'nin en çok takip edilen haber kaynağı olmak.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <Award size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-4">Değerlerimiz</h3>
                    <p className="text-gray-600">
                        Doğruluk, tarafsızlık, insan haklarına saygı ve basın meslek ilkelerine bağlılık temel değerlerimizdir.
                    </p>
                </div>
            </div>

            {/* Team Section */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12">Yönetim Ekibimiz</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                        { name: "Ahmet Yılmaz", role: "Genel Yayın Yönetmeni" },
                        { name: "Ayşe Demir", role: "Yazı İşleri Müdürü" },
                        { name: "Mehmet Kaya", role: "Teknoloji Editörü" },
                        { name: "Zeynep Çelik", role: "Ekonomi Editörü" }
                    ].map((member, index) => (
                        <div key={index} className="text-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${member.name}&background=random`}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">{member.name}</h4>
                            <p className="text-primary font-medium">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Corporate Identity Section */}
            <div className="text-center border-t border-gray-200 pt-12">
                <h2 className="text-2xl font-bold mb-6">Kurumsal Kimlik</h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Logomuz, renklerimiz ve diğer kurumsal kimlik öğelerimize aşağıdaki bağlantıdan ulaşabilirsiniz.
                </p>
                <a
                    href="/kurumsal-kimlik.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-primary transition-colors"
                >
                    <Award size={20} className="mr-2" />
                    Kurumsal Kimlik Dosyasını Görüntüle
                </a>
            </div>
        </div>
    );
};

export default AboutPage;
