import React, { useState, useEffect } from 'react';
import { Users, Target, Award } from 'lucide-react';
import SEO from '../components/SEO';
import { adminService } from '../services/adminService';

const AboutPage = () => {
    const [loading, setLoading] = useState(true);
    const [pageData, setPageData] = useState(null);
    const [extracted, setExtracted] = useState({
        heroTitle: 'Hakkımızda',
        heroText: "Haberfoni, 2025 yılında kurulmuş, tarafsız ve doğru habercilik ilkesiyle yayın yapan Türkiye'nin yeni nesil haber platformudur.",
        mission: 'Okuyucularımıza en güncel haberleri, en hızlı ve en doğru şekilde, tarafsızlık ilkesinden ödün vermeden ulaştırmak.',
        vision: "Dijital habercilikte güvenilirliğin ve kalitenin adresi olarak, Türkiye'nin en çok takip edilen haber kaynağı olmak.",
        values: 'Doğruluk, tarafsızlık, insan haklarına saygı ve basın meslek ilkelerine bağlılık temel değerlerimizdir.',
        team: [
            { name: "Ahmet Yılmaz", role: "Genel Yayın Yönetmeni" },
            { name: "Ayşe Demir", role: "Yazı İşleri Müdürü" },
            { name: "Mehmet Kaya", role: "Teknoloji Editörü" },
            { name: "Zeynep Çelik", role: "Ekonomi Editörü" }
        ],
        corporateIdentity: {
            title: 'Kurumsal Kimlik',
            description: 'Logomuz, renklerimiz ve diğer kurumsal kimlik öğelerimize aşağıdaki bağlantıdan ulaşabilirsiniz.',
            buttonText: 'Kurumsal Kimlik Dosyasını Görüntüle',
            fileUrl: '/kurumsal-kimlik.html'
        }
    });

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const data = await adminService.getPageBySlug('hakkimizda');
                if (data && data.is_active) {
                    setPageData(data);

                    if (data.content) {
                        const heroTitleMatch = data.content.match(/<!-- ABOUT_HERO_START -->[\s\S]*?<h1[^>]*>(.*?)<\/h1>/);
                        const heroTextMatch = data.content.match(/<!-- ABOUT_HERO_START -->[\s\S]*?<p[^>]*text-xl[^>]*>([\s\S]*?)<\/p>/);

                        const missionMatch = data.content.match(/Misyonumuz<\/h3>[\s\S]*?<p[^>]*>(.*?)<\/p>/);
                        const visionMatch = data.content.match(/Vizyonumuz<\/h3>[\s\S]*?<p[^>]*>(.*?)<\/p>/);
                        const valuesMatch = data.content.match(/Değerlerimiz<\/h3>[\s\S]*?<p[^>]*>(.*?)<\/p>/);

                        // Parse Team Members
                        const teamMembers = [];
                        const teamRegex = /<h4[^>]*>(.*?)<\/h4>[\s\S]*?<p[^>]*text-primary[^>]*>(.*?)<\/p>/g;
                        let match;
                        const teamBlock = data.content.match(/<!-- ABOUT_TEAM_START -->([\s\S]*?)<!-- ABOUT_TEAM_END -->/);

                        if (teamBlock) {
                            while ((match = teamRegex.exec(teamBlock[1])) !== null) {
                                teamMembers.push({
                                    name: match[1],
                                    role: match[2]
                                });
                            }
                        }

                        setExtracted({
                            heroTitle: heroTitleMatch ? heroTitleMatch[1] : 'Hakkımızda',
                            heroText: heroTextMatch ? heroTextMatch[1].trim() : extracted.heroText,
                            mission: missionMatch ? missionMatch[1] : extracted.mission,
                            vision: visionMatch ? visionMatch[1] : extracted.vision,
                            values: valuesMatch ? valuesMatch[1] : extracted.values,
                            team: teamMembers.length > 0 ? teamMembers : extracted.team,
                            corporateIdentity: {
                                title: data.content.match(/<!-- ABOUT_CI_START -->[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]?.trim() || 'Kurumsal Kimlik',
                                description: data.content.match(/<!-- ABOUT_CI_START -->[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/)?.[1]?.trim() || 'Logomuz, renklerimiz ve diğer kurumsal kimlik öğelerimize aşağıdaki bağlantıdan ulaşabilirsiniz.',
                                buttonText: data.content.match(/<!-- ABOUT_CI_START -->[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/)?.[1].replace(/<[^>]+>/g, '').trim() || 'Kurumsal Kimlik Dosyasını Görüntüle',
                                fileUrl: data.content.match(/<!-- ABOUT_CI_START -->[\s\S]*?<a[^>]*href="(.*?)"/)?.[1] || '/kurumsal-kimlik.html'
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching about page:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPage();
    }, []);

    // Initial loading state or fallback to default static content if load fails but no data
    // actually we initialize state with defaults so we can just render using `extracted`

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <SEO
                    title={pageData?.meta_title || "Hakkımızda"}
                    description={pageData?.meta_description || "Haberfoni hakkında bilgi alın. Misyonumuz, vizyonumuz ve ekibimizle tanışın."}
                    url="/hakkimizda"
                />

                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{extracted.heroTitle}</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        {extracted.heroText}
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
                            {extracted.mission}
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                            <Users size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">Vizyonumuz</h3>
                        <p className="text-gray-600">
                            {extracted.vision}
                        </p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                            <Award size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-4">Değerlerimiz</h3>
                        <p className="text-gray-600">
                            {extracted.values}
                        </p>
                    </div>
                </div>

                {/* Team Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Yönetim Ekibimiz</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {extracted.team.map((member, index) => (
                            <div key={index} className="text-center">
                                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`}
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
                    <h2 className="text-2xl font-bold mb-6">{extracted.corporateIdentity.title}</h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        {extracted.corporateIdentity.description}
                    </p>
                    <a
                        href={extracted.corporateIdentity.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-primary transition-colors"
                    >
                        <Award size={20} className="mr-2" />
                        {extracted.corporateIdentity.buttonText}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
