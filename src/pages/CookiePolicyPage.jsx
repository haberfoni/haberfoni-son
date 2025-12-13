import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { adminService } from '../services/adminService';

const CookiePolicyPage = () => {
    const [pageData, setPageData] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await adminService.getPageBySlug('cerez-politikasi');
                if (data) {
                    setPageData(data);
                }
            } catch (error) {
                console.error('Error loading page:', error);
            }
        };
        fetchPage();
    }, []);

    return (
        <div className="container mx-auto px-4 py-12">
            <SEO
                title={pageData?.meta_title || "Çerez Politikası"}
                description={pageData?.meta_description || "Haberfoni Çerez (Cookie) Politikası. Sitemizde kullanılan çerezler ve kullanım amaçları hakkında bilgi alın."}
                url="/cerez-politikasi"
            />
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                {pageData?.content ? (
                    <div
                        className="prose prose-lg max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: pageData.content }}
                    />
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-8 text-gray-900">Çerez (Cookie) Politikası</h1>

                        <div className="prose prose-lg max-w-none text-gray-700">
                            <p>
                                Haberfoni olarak, kullanıcılarımızın deneyimini geliştirmek, web sitemizin verimli çalışmasını sağlamak
                                ve hizmetlerimizi kişiselleştirmek amacıyla çerezler (cookies) kullanmaktayız.
                            </p>

                            <h3>1. Çerez Nedir?</h3>
                            <p>
                                Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınız aracılığıyla cihazınıza veya ağ sunucusuna
                                depolanan küçük metin dosyalarıdır.
                            </p>

                            <h3>2. Kullanılan Çerez Türleri</h3>
                            <ul>
                                <li><strong>Zorunlu Çerezler:</strong> Web sitesinin düzgün çalışması için gerekli olan çerezlerdir.</li>
                                <li><strong>Performans ve Analiz Çerezleri:</strong> Sitenin nasıl kullanıldığını analiz ederek performansı artırmamıza yardımcı olur.</li>
                                <li><strong>Hedefleme ve Reklam Çerezleri:</strong> İlgi alanlarınıza göre size uygun reklamlar göstermek için kullanılır.</li>
                            </ul>

                            <h3>3. Çerezlerin Kullanım Amacı</h3>
                            <p>
                                Çerezleri; sitemizin işlevselliğini ve performansını artırmak, güvenliği sağlamak ve size daha iyi bir
                                haber deneyimi sunmak için kullanıyoruz.
                            </p>

                            <h3>4. Çerez Tercihlerinin Yönetimi</h3>
                            <p>
                                Tarayıcınızın ayarlarını değiştirerek çerezlere ilişkin tercihlerinizi kişiselleştirme imkanına sahipsiniz.
                                Ancak, çerezleri devre dışı bırakmanız durumunda sitemizin bazı özelliklerinin çalışmayabileceğini unutmayınız.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CookiePolicyPage;
