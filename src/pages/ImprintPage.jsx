import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { adminService } from '../services/adminService';

const ImprintPage = () => {
    const [pageData, setPageData] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await adminService.getPageBySlug('kunye');
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
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <SEO
                    title={pageData?.meta_title || "Künye"}
                    description={pageData?.meta_description || "Haberfoni künye bilgileri. İmtiyaz sahibi, yayın yönetmeni ve editör kadrosu."}
                    url="/kunye"
                />

                {/* Content rendering logic */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 max-w-4xl mx-auto">
                    {pageData?.content ? (
                        <div
                            className="prose max-w-none prose-headings:text-gray-900 prose-a:text-primary hover:prose-a:underline"
                            dangerouslySetInnerHTML={{ __html: pageData.content }}
                        />
                    ) : (
                        const defaultContent = `
                            <h1 class="text-4xl font-bold mb-10 text-center">Künye</h1>
                            <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
                                    <h2 class="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">İmtiyaz Sahibi</h2>
                                    <div class="space-y-3">
                                        <div>
                                            <p class="font-semibold text-lg text-gray-900">Haberfoni Medya A.Ş.</p>
                                            <p class="text-gray-600 text-sm">Adına: Ahmet Yılmaz</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
                                    <h2 class="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">Genel Yayın Yönetmeni</h2>
                                    <div class="space-y-3">
                                        <div>
                                            <p class="font-semibold text-lg text-gray-900">Ahmet Yılmaz</p>
                                            <p class="text-gray-500 text-xs mt-0.5">ahmet@haberportalim.com</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
                                    <h2 class="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">Hukuk Danışmanı</h2>
                                    <div class="space-y-3">
                                        <div>
                                            <p class="font-semibold text-lg text-gray-900">Av. Mehmet Öz</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
                                    <h2 class="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">Sorumlu Yazı İşleri</h2>
                                    <div class="space-y-3">
                                        <div>
                                            <p class="font-semibold text-lg text-gray-900">Ayşe Demir</p>
                                            <p class="text-gray-500 text-xs mt-0.5">ayse@haberportalim.com</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
                                    <h2 class="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">İletişim & Adres</h2>
                                    <div class="space-y-3">
                                        <div>
                                            <p class="font-semibold text-lg text-gray-900">Maslak Mah. Büyükdere Cad.</p>
                                            <p class="text-gray-600 text-sm">Sarıyer / İstanbul</p>
                                        </div>
                                        <div>
                                            <p class="font-semibold text-lg text-gray-900">Tel: +90 212 123 45 67</p>
                                            <p class="text-gray-600 text-sm">E-posta: info@haberportalim.com</p>
                                            <p class="text-gray-500 text-xs mt-0.5">KEP: haberportalim@hs01.kep.tr</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="max-w-4xl mx-auto mt-12 bg-gray-50 p-8 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-200">
                                <h3 class="font-bold text-gray-900 mb-2">Yasal Uyarı</h3>
                                <p>
                                    Haberfoni web sitesinde yayınlanan haber, yazı, resim ve fotoğrafların Fikir ve Sanat Eserleri Kanunu gereğince izin alınmadan, kaynak gösterilerek dahi iktibas edilmesi yasaktır. Sitede yer alan köşe yazılarının sorumluluğu yazarlarına aittir.
                                </p>
                                <p class="mt-2">
                                    Haberfoni, basın meslek ilkelerine uymaya söz vermiştir.
                                </p>
                            </div>
                        `;

                    await adminService.updatePage(data.id, {content: defaultContent });
                    setPageData({...data, content: defaultContent });
                    }
                }
            } catch (err) {
                        console.error('Error loading imprint page:', err);
            }
        };

                    fetchPage();
    }, []);

                    return (
                    <div className="container mx-auto px-4 py-12">
                        <SEO
                            title={pageData?.meta_title || "Künye"}
                            description={pageData?.meta_description || "Haberfoni künye bilgileri. İmtiyaz sahibi, genel yayın yönetmeni ve iletişim bilgileri."}
                            url="/kunye"
                        />

                        {pageData?.content ? (
                            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
                        ) : (
                            <div className="text-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                            </div>
                        )}
                    </div>
                    );
};

                    export default ImprintPage;
