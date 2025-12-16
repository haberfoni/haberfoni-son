import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import SEO from '../components/SEO';

const CareersPage = () => {
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);

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
                                <span class="flex items-center gap-1">Haber Merkezi</span>
                                <span class="flex items-center gap-1">Tam Zamanlı</span>
                                <span class="flex items-center gap-1">İstanbul (Ofis)</span>
                            </div>
                        </div>
                        <button class="bg-gray-50 text-gray-700 font-semibold py-2 px-6 rounded-lg group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                            Başvur
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
        </div>
    `;

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await adminService.getPageBySlug('kariyer');

                if (!data) {
                    console.log('Page not found, creating...');
                    const newPage = await adminService.createPage({
                        title: 'Kariyer',
                        slug: 'kariyer',
                        content: staticContent,
                        is_active: true,
                        meta_title: 'Kariyer Fırsatları - Haberfoni',
                        meta_description: 'Haberfoni ekibine katılın. Açık pozisyonlar ve başvuru detayları.'
                    });
                    setPageData(newPage);
                } else if (!data.content || data.content.trim() === '') {
                    console.log('Page content empty, using static...');
                    // Optionally update DB with static content if it's empty
                    const updatedPage = await adminService.updatePage(data.id, { ...data, content: staticContent });
                    setPageData(updatedPage);
                } else {
                    setPageData(data);
                }
            } catch (err) {
                console.error('API Error:', err);
                // Fallback to static content object if API fails
                setPageData({
                    title: 'Kariyer Fırsatları',
                    content: staticContent,
                    meta_title: 'Kariyer Fırsatları - Haberfoni',
                    meta_description: 'Haberfoni ekibine katılın.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <SEO
                    title={pageData?.meta_title || "Kariyer Fırsatları"}
                    description={pageData?.meta_description || "Haberfoni ekibine katılın."}
                    url="/kariyer"
                />

                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: pageData?.content || staticContent }} />
            </div>
        </div>
    );
};

export default CareersPage;
