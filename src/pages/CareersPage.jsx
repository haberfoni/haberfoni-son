import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, MapPin, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import { adminService } from '../services/adminService';

const CareersPage = () => {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await adminService.getPageBySlug('kariyer');
                if (data) {
                    setPageData(data);
                }
            } catch (err) {
                console.error('API Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <SEO
                    title={pageData?.meta_title || "Kariyer Fırsatları"}
                    description={pageData?.meta_description || "Haberfoni ekibine katılın. Açık pozisyonlar ve başvuru detayları."}
                    url="/kariyer"
                />

                // Existing static content as fallback/initial
                const staticContent = `
                <div class="text-center mb-10 md:mb-16">
                    <h1 class="text-3xl md:text-4xl font-bold mb-4 md:mb-6">Kariyer Fırsatları</h1>
                    <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                        Geleceğin medyasını birlikte inşa edelim. Dinamik, yaratıcı ve tutkulu ekibimize katılın.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20">
                    <div class="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-xl font-bold mb-4 text-primary">Sürekli Gelişim</h3>
                        <p class="text-gray-600">
                            Mesleki gelişiminizi destekliyor, eğitim ve konferans katılımları ile yeteneklerinizi artırmanızı sağlıyoruz.
                        </p>
                    </div>
                    <div class="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-xl font-bold mb-4 text-primary">Esnek Çalışma</h3>
                        <p class="text-gray-600">
                            Hibrit çalışma modeli ile ofis ve uzaktan çalışma dengesini kuruyor, verimliliğinizi önemsiyoruz.
                        </p>
                    </div>
                    <div class="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-xl font-bold mb-4 text-primary">Modern Teknoloji</h3>
                        <p class="text-gray-600">
                            En son medya teknolojileri ve dijital araçlarla çalışarak, sektörün öncüsü olmanızı sağlıyoruz.
                        </p>
                    </div>
                </div>

                <div class="max-w-4xl mx-auto">
                    <h2 class="text-2xl font-bold mb-6 md:mb-8 text-center md:text-left">Açık Pozisyonlar</h2>

                    <div class="space-y-4">
                        <div class="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 class="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">Kıdemli Muhabir</h3>
                                    <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                        <span class="flex items-center gap-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="lucide lucide-briefcase" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> Haber Merkezi</span>
                                        <span class="flex items-center gap-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="lucide lucide-clock" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> Tam Zamanlı</span>
                                        <span class="flex items-center gap-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="lucide lucide-map-pin" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0Z" /><circle cx="12" cy="10" r="3" /></svg> İstanbul (Ofis)</span>
                                    </div>
                                </div>
                                <button class="bg-gray-50 text-gray-700 font-semibold py-2 px-6 rounded-lg group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                                    Başvur <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="lucide lucide-arrow-right" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="mt-12 text-center p-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                        <h3 class="text-lg font-bold mb-2">Aradığınız pozisyonu bulamadınız mı?</h3>
                        <p class="text-gray-600 mb-4">
                            Genel başvurularınızı değerlendirmek üzere özgeçmişinizi veritabanımıza ekleyebilirsiniz.
                        </p>
                        <button class="text-primary font-bold hover:underline">Genel Başvuru Yap &rarr;</button>
                    </div>
                </div>`;

                if (!page) {
                    // Create if not exists
                    console.log('Page not found, creating...');
                const newPage = await adminService.createPage({
                    title: 'Kariyer',
                slug: 'kariyer',
                content: staticContent,
                is_active: true,
                meta_title: 'Kariyer - Haberfoni',
                meta_description: 'Haberfoni kariyer fırsatları.'
                    });
                setPageData(newPage);
                } else if (!page.content) {
                    // Migrate content if empty
                    console.log('Page content empty, updating with static...');
                const updatedPage = await adminService.updatePage(page.id, {...page, content: staticContent });
                setPageData({...page, content: staticContent });
                } else {
                    console.log('Using fetched content');
                setPageData(page);
                }
            } catch (error) {
                    console.error('Error fetching careers page:', error);
            } finally {
                    setLoading(false);
            }
        };

                fetchContent();
    }, []);

                if (loading) {
        return <div className="min-h-screen pt-20 pb-12 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>;
    }

                return (
                <div className="container mx-auto px-4 py-12">
                    <SEO
                        title={pageData?.meta_title || "Kariyer"}
                        description={pageData?.meta_description || "Haberfoni kariyer fırsatları. Ekibimize katılın ve geleceğin medyasını birlikte inşa edelim."}
                        url="/kariyer"
                    />

                    <div dangerouslySetInnerHTML={{ __html: pageData?.content || '' }} />
                </div>
                );
};

                export default CareersPage;
