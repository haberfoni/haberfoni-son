import React from 'react';
import { Briefcase, Clock, MapPin, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';

const CareersPage = () => {
    return (
        <div className="container mx-auto px-4 py-12">
            <SEO
                title="Kariyer"
                description="Haberfoni kariyer fırsatları. Ekibimize katılın ve geleceğin medyasını birlikte inşa edelim."
                url="/kariyer"
            />
            {/* Hero */}
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-6">Kariyer Fırsatları</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Geleceğin medyasını birlikte inşa edelim. Dinamik, yaratıcı ve tutkulu ekibimize katılın.
                </p>
            </div>

            {/* Why Us */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 text-primary">Sürekli Gelişim</h3>
                    <p className="text-gray-600">
                        Mesleki gelişiminizi destekliyor, eğitim ve konferans katılımları ile yeteneklerinizi artırmanızı sağlıyoruz.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 text-primary">Esnek Çalışma</h3>
                    <p className="text-gray-600">
                        Hibrit çalışma modeli ile ofis ve uzaktan çalışma dengesini kuruyor, verimliliğinizi önemsiyoruz.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-4 text-primary">Modern Teknoloji</h3>
                    <p className="text-gray-600">
                        En son medya teknolojileri ve dijital araçlarla çalışarak, sektörün öncüsü olmanızı sağlıyoruz.
                    </p>
                </div>
            </div>

            {/* Open Positions */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-8">Açık Pozisyonlar</h2>

                <div className="space-y-4">
                    {[
                        { title: "Kıdemli Muhabir", type: "Tam Zamanlı", location: "İstanbul (Ofis)", dept: "Haber Merkezi" },
                        { title: "SEO Uzmanı", type: "Tam Zamanlı", location: "Hibrit", dept: "Dijital Pazarlama" },
                        { title: "Sosyal Medya Yöneticisi", type: "Tam Zamanlı", location: "İstanbul (Ofis)", dept: "Sosyal Medya" },
                        { title: "Video Editörü", type: "Yarı Zamanlı", location: "Uzaktan", dept: "Prodüksiyon" },
                        { title: "Frontend Geliştirici", type: "Tam Zamanlı", location: "Uzaktan", dept: "Yazılım" }
                    ].map((job, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">{job.title}</h3>
                                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                        <span className="flex items-center gap-1"><Briefcase size={16} /> {job.dept}</span>
                                        <span className="flex items-center gap-1"><Clock size={16} /> {job.type}</span>
                                        <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                                    </div>
                                </div>
                                <button className="bg-gray-50 text-gray-700 font-semibold py-2 px-6 rounded-lg group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                                    Başvur <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center p-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                    <h3 className="text-lg font-bold mb-2">Aradığınız pozisyonu bulamadınız mı?</h3>
                    <p className="text-gray-600 mb-4">
                        Genel başvurularınızı değerlendirmek üzere özgeçmişinizi veritabanımıza ekleyebilirsiniz.
                    </p>
                    <button className="text-primary font-bold hover:underline">Genel Başvuru Yap &rarr;</button>
                </div>
            </div>
        </div>
    );
};

export default CareersPage;
