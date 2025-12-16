import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, AlertTriangle, Eye, Users, Play, MousePointer, BarChart, Layout, ArrowUp, ArrowDown, Trash2, Plus, Layers, Image as ImageIcon, Upload } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { slugify } from '../../utils/slugify';
import RichTextEditor from '../../components/RichTextEditor';

// SVG constants for HTML generation
const ICONS = {
    Monitor: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>`,
    Users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    Play: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
    Smartphone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`,
    Megaphone: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
    Layers: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`
};

const LOCKED_SLUGS = ['hakkimizda', 'iletisim', 'kunye', 'reklam', 'kariyer'];

const PageEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [manualSlug, setManualSlug] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(null); // Track which card is uploading

    // Ad Models State
    const [adModels, setAdModels] = useState([
        { id: 1, title: 'Display Reklamlar', description: 'Ana sayfa, kategori sayfaları ve haber detaylarında yüksek görünürlüklü banner alanları.', features: ['970x250 Masthead', '300x250 Sidebar', '300x600 Sticky'], icon: 'Monitor', image: '' },
        { id: 2, title: 'Sponsorlu İçerik', description: 'Markanızın hikayesini haber formatında okuyucularımıza aktarın. SEO uyumlu ve kalıcı içerikler.', features: ['Özel Röportajlar', 'Ürün İncelemeleri', 'Basın Bültenleri'], icon: 'Users', image: '' },
        { id: 3, title: 'Video Reklamları', description: 'Haber akışı içinde doğal görünümlü video ve native reklam yerleşimleri.', features: ['Pre-roll Video', 'In-read Video', 'Native Grid'], icon: 'Play', image: '' },
        { id: 4, title: 'Pop-up Reklamlar', description: 'Kullanıcı etkileşimini artıran, özel zamanlamalı tam ekran veya modal reklamlar.', features: ['Exit-Intent Popup', 'Zamanlı Modal', 'Scroll Tetiklemeli'], icon: 'Layers', image: '' }
    ]);
    // Imprint (Künye) State
    const [imprintData, setImprintData] = useState([
        {
            id: 'imp-1',
            title: 'İmtiyaz Sahibi',
            members: [
                { id: 'm-1', name: 'Haberfoni Medya A.Ş.', role: 'Adına: Ahmet Yılmaz', email: '' }
            ]
        },
        {
            id: 'imp-2',
            title: 'Genel Yayın Yönetmeni',
            members: [
                { id: 'm-2', name: 'Ahmet Yılmaz', role: '', email: 'ahmet@haberportalim.com' }
            ]
        },
        {
            id: 'imp-3',
            title: 'Hukuk Danışmanı',
            members: [
                { id: 'm-3', name: 'Av. Mehmet Öz', role: '', email: '' }
            ]
        },
        {
            id: 'imp-4',
            title: 'Sorumlu Yazı İşleri',
            members: [
                { id: 'm-4', name: 'Ayşe Demir', role: '', email: 'ayse@haberportalim.com' }
            ]
        },
        {
            id: 'imp-5',
            title: 'İletişim & Adres',
            members: [
                { id: 'm-5', name: 'Maslak Mah. Büyükdere Cad.', role: 'Sarıyer / İstanbul', email: '' },
                { id: 'm-6', name: 'Tel: +90 212 123 45 67', role: 'E-posta: info@haberportalim.com', email: 'KEP: haberportalim@hs01.kep.tr' }
            ]
        }
    ]);

    const [careersData, setCareersData] = useState({
        heroTitle: 'Kariyer Fırsatları',
        heroDescription: 'Geleceğin medyasını birlikte inşa edelim. Dinamik, yaratıcı ve tutkulu ekibimize katılın.',
        positionsTitle: 'Açık Pozisyonlar',
        positionsText: 'Şu an açık pozisyon bulunmamaktadır. Ancak genel başvurularınızı ik@haberfoni.com adresine CV göndererek yapabilirsiniz.',
        extraHtml: ''
    });

    const [contactData, setContactData] = useState({
        title: 'İletişim',
        description: 'Görüşleriniz, önerileriniz ve sorularınız bizim için değerli. Aşağıdaki formu doldurarak veya iletişim kanallarımızdan bize ulaşabilirsiniz.',
        emails: 'info@haberportalim.com\nreklam@haberportalim.com',
        phones: '+90 212 123 45 67\nHafta içi 09:00 - 18:00',
        address: 'Maslak Mah. Büyükdere Cad.\nNo:123 Sarıyer\nİstanbul, Türkiye',
        mapsCode: '',
        extraHtml: ''
    });

    // About Us State
    const [aboutData, setAboutData] = useState({
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

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        meta_title: '',
        meta_description: '',
        is_active: true
    });

    useEffect(() => {
        if (isEditing) {
            loadPage();
        }
    }, [id]);

    const handleImageUpload = async (index, file) => {
        if (!file) return;
        setUploadingImage(index);
        try {
            const url = await adminService.uploadImage(file);
            const newModels = [...adModels];
            newModels[index].image = url;
            setAdModels(newModels);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Resim yüklenirken bir hata oluştu.');
        } finally {
            setUploadingImage(null);
        }
    };

    const loadPage = async () => {
        try {
            const data = await adminService.getPage(id);
            if (data) {
                setFormData({
                    title: data.title,
                    slug: data.slug,
                    content: data.content,
                    meta_title: data.meta_title || '',
                    meta_description: data.meta_description || '',
                    is_active: data.is_active
                });

                // Parse Careers content
                if (data.slug === 'kariyer' && data.content) {
                    const heroTitleMatch = data.content.match(/<h1[^>]*>(.*?)<\/h1>/);
                    const heroDescMatch = data.content.match(/<p[^>]*text-xl[^>]*>(.*?)<\/p>/);
                    const positionsTitleMatch = data.content.match(/<h2[^>]*>(.*?)<\/h2>/);

                    // Simple text extraction for positions, assuming it's in prose div
                    const positionsTextMatch = data.content.match(/<div class="prose[^>]*>([\s\S]*?)<\/div>/);

                    const extraHtmlParts = data.content.split('<!-- EXTRA_HTML_START -->');
                    const extraHtml = extraHtmlParts.length > 1 ? extraHtmlParts[1].replace('<!-- EXTRA_HTML_END -->', '').trim() : '';

                    setCareersData({
                        heroTitle: heroTitleMatch ? heroTitleMatch[1] : 'Kariyer Fırsatları',
                        heroDescription: heroDescMatch ? heroDescMatch[1] : 'Geleceğin medyasını birlikte inşa edelim.',
                        positionsTitle: positionsTitleMatch ? positionsTitleMatch[1] : 'Açık Pozisyonlar',
                        positionsText: positionsTextMatch ? positionsTextMatch[1].trim() : '',
                        extraHtml: extraHtml
                    });
                }

                // Parse Contact content
                if (data.slug === 'iletisim' && data.content) {
                    const heroTitleMatch = data.content.match(/<h1[^>]*>(.*?)<\/h1>/);
                    const heroDescMatch = data.content.match(/<p[^>]*text-gray-600 max-w-2xl[^>]*>([\s\S]*?)<\/p>/);

                    // Simple extraction based on assumed structure for now, mostly relying explicitly on previously saved extraHtml or defaults
                    // A proper parser would be complex, so we will rely on parsing known markers if we save them, or defaults

                    const extraHtmlParts = data.content.split('<!-- EXTRA_HTML_START -->');
                    const extraHtml = extraHtmlParts.length > 1 ? extraHtmlParts[1].replace('<!-- EXTRA_HTML_END -->', '').trim() : '';

                    const mapParts = data.content.split('<!-- MAP_START -->');
                    const mapCode = mapParts.length > 1 ? mapParts[1].split('<!-- MAP_END -->')[0].trim() : '';

                    // Try to extract contact info if possible, otherwise use defaults/state
                    // This creates a limitation: if external edits happen, they might not parse back perfectly without markers.
                    // For now, we will assume state defaults or whatever we can grab if we add markers later.
                    // To be safe, let's look for specific IDs or comments if we were fetching fresh, but for now let's just use defaults + extra/map

                    setContactData(prev => ({
                        ...prev,
                        title: heroTitleMatch ? heroTitleMatch[1] : prev.title,
                        description: heroDescMatch ? heroDescMatch[1].trim() : prev.description,
                        mapsCode: mapCode,
                        extraHtml: extraHtml
                    }));
                }

                // Parse About Us content
                if (data.slug === 'hakkimizda' && data.content) {
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

                    setAboutData({
                        heroTitle: heroTitleMatch ? heroTitleMatch[1] : 'Hakkımızda',
                        heroText: heroTextMatch ? heroTextMatch[1].trim() : '',
                        mission: missionMatch ? missionMatch[1] : '',
                        vision: visionMatch ? visionMatch[1] : '',
                        values: valuesMatch ? valuesMatch[1] : '',
                        team: teamMembers.length > 0 ? teamMembers : [
                            { name: "Ahmet Yılmaz", role: "Genel Yayın Yönetmeni" }
                        ],
                        corporateIdentity: {
                            title: data.content.match(/<!-- ABOUT_CI_START -->[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1]?.trim() || 'Kurumsal Kimlik',
                            description: data.content.match(/<!-- ABOUT_CI_START -->[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/)?.[1]?.trim() || 'Logomuz, renklerimiz ve diğer kurumsal kimlik öğelerimize aşağıdaki bağlantıdan ulaşabilirsiniz.',
                            buttonText: data.content.match(/<!-- ABOUT_CI_START -->[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/)?.[1].replace(/<[^>]+>/g, '').trim() || 'Kurumsal Kimlik Dosyasını Görüntüle',
                            fileUrl: data.content.match(/<!-- ABOUT_CI_START -->[\s\S]*?<a[^>]*href="(.*?)"/)?.[1] || '/kurumsal-kimlik.html'
                        }
                    });
                }

                // If slug is different from what we'd generate, enable manual mode
                if (data.slug !== slugify(data.title)) {
                    setManualSlug(true);
                }
            }
        } catch (error) {
            console.error('Error loading page:', error);
            setMessage({ type: 'error', text: 'Sayfa bilgileri yüklenemedi.' });
        } finally {
            setLoading(false);
        }
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        if (!manualSlug) {
            setFormData(prev => ({
                ...prev,
                title,
                slug: slugify(title)
            }));
        } else {
            setFormData(prev => ({ ...prev, title }));
        }
    };

    // Generate HTML from Ad Models
    const generateAdModelsHtml = () => {
        const modelsHtml = adModels.map(model => `
            <div class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group bg-white">
                <div class="h-48 w-full bg-gray-50 relative overflow-hidden group-hover:opacity-90 transition-opacity">
                    ${model.image ? `<img src="${model.image}" alt="${model.title}" class="w-full h-full object-cover" />` : `
                    <div class="h-full w-full flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                        ${ICONS[model.icon] || ICONS.Monitor}
                    </div>
                    `}
                </div>
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-3 text-gray-800">${model.title}</h3>
                    <p class="text-gray-600 mb-4 text-sm">${model.description}</p>
                    <ul class="text-xs text-gray-400 space-y-2">
                        ${model.features.map(f => {
            const ft = f.trim();
            // Remove bullet if user added it manually
            const cleanFt = ft.startsWith('•') || ft.startsWith('-') ? ft.substring(1).trim() : ft;
            return cleanFt ? `<li>• ${cleanFt}</li>` : '';
        }).join('')}
                    </ul>
                </div>
            </div>
        `).join('');

        return `
            <div class="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h2 class="text-3xl font-bold text-gray-900">Reklam Modellerimiz</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${modelsHtml}
            </div>
        `;
    };

    // Generate HTML from Imprint Data
    const generateImprintHtml = () => {
        // Split data into two columns for better layout, or just use grid
        // Let's use a responsive grid logic
        const sectionsHtml = imprintData.map(section => `
            <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
                <h2 class="text-primary font-bold text-lg mb-4 uppercase tracking-wider border-b pb-2">${section.title}</h2>
                <div class="space-y-3">
                    ${section.members.map(member => `
                        <div>
                            <p class="font-semibold text-lg text-gray-900">${member.name}</p>
                            ${member.role ? `<p class="text-gray-600 text-sm">${member.role}</p>` : ''}
                            ${member.email ? `<p class="text-gray-500 text-xs mt-0.5">${member.email}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        return `
            <h1 class="text-4xl font-bold mb-10 text-center">Künye</h1>
            <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                ${sectionsHtml}
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
    };

    const generateCareersHtml = () => {
        return `
            <div class="text-center mb-10 md:mb-16">
                <h1 class="text-3xl md:text-4xl font-bold mb-4 md:mb-6">${careersData.heroTitle}</h1>
                <p class="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                    ${careersData.heroDescription}
                </p>
            </div>

            <div class="max-w-4xl mx-auto mb-12 md:mb-16">
                <h2 class="text-2xl font-bold mb-6 md:mb-8 text-center md:text-left">${careersData.positionsTitle}</h2>
                <div class="prose max-w-none text-gray-600 bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                    ${careersData.positionsText}
                </div>
            </div>

            <!-- EXTRA_HTML_START -->
            ${careersData.extraHtml}
            <!-- EXTRA_HTML_END -->
        `;
    };

    const generateContactHtml = () => {
        const emailsHtml = contactData.emails.split('\n').filter(e => e.trim()).map(e => `<p class="text-gray-600">${e}</p>`).join('');
        const phonesHtml = contactData.phones.split('\n').filter(e => e.trim()).map((e, i) => i === 0 ? `<p class="text-gray-600">${e}</p>` : `<p class="text-gray-600 text-sm text-gray-500">${e}</p>`).join('');
        const addressHtml = contactData.address.split('\n').filter(e => e.trim()).join('<br />');

        return `
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold mb-4">${contactData.title}</h1>
                <p class="text-gray-600 max-w-2xl mx-auto">
                    ${contactData.description}
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                <!-- INFO_COL_START -->
                <div class="lg:col-span-1 space-y-8">
                    <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-xl font-bold mb-6 text-gray-900">İletişim Bilgileri</h3>

                        <div class="space-y-6">
                            <div class="flex items-start space-x-4">
                                <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <!-- MAIL ICON -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">E-posta</h4>
                                    ${emailsHtml}
                                </div>
                            </div>

                            <div class="flex items-start space-x-4">
                                <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <!-- PHONE ICON -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Telefon</h4>
                                    ${phonesHtml}
                                </div>
                            </div>

                            <div class="flex items-start space-x-4">
                                <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <!-- PIN ICON -->
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Adres</h4>
                                    <p class="text-gray-600">
                                        ${addressHtml}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl overflow-hidden h-64 w-full shadow-sm border border-gray-100">
                         <!-- MAP_START -->
                        ${contactData.mapsCode || '<div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Harita Kodu Girilmedi</div>'}
                         <!-- MAP_END -->
                    </div>
                </div>
                <!-- INFO_COL_END -->

                <div class="lg:col-span-2">
                    <!-- CONTACT_FORM_PLACEHOLDER -->
                    <!-- This part is replaced by the React Component logic in ContactPage, but we keep the structure here for visual preview if we were rendering it fully static -->
                     <form onsubmit="return false;" class="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                        <h3 class="text-xl font-bold mb-6 text-gray-900">Bize Yazın</h3>
                        <!-- Form fields are managed by React component -->
                        <div class="p-4 bg-gray-50 text-center text-gray-500 rounded">İletişim Formu Alanı (Otomatik)</div>
                    </form>
                </div>
            </div>

            <!-- EXTRA_HTML_START -->
            ${contactData.extraHtml}
            <!-- EXTRA_HTML_END -->
        `;
    };

    const generateAboutHtml = () => {
        const teamHtml = aboutData.team.map(member => `
            <div class="text-center">
                <div class="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random" alt="${member.name}" class="w-full h-full object-cover" />
                </div>
                <h4 class="text-lg font-bold text-gray-900">${member.name}</h4>
                <p class="text-primary font-medium">${member.role}</p>
            </div>
        `).join('');

        return `
            <!-- ABOUT_HERO_START -->
            <div class="text-center mb-16">
                <h1 class="text-4xl md:text-5xl font-bold mb-6 text-gray-900">${aboutData.heroTitle}</h1>
                <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    ${aboutData.heroText}
                </p>
            </div>
            <!-- ABOUT_HERO_END -->

            <!-- ABOUT_MVV_START -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <!-- TARGET ICON -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-4">Misyonumuz</h3>
                    <p class="text-gray-600">${aboutData.mission}</p>
                </div>
                <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <!-- USERS ICON -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-4">Vizyonumuz</h3>
                    <p class="text-gray-600">${aboutData.vision}</p>
                </div>
                <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <!-- AWARD ICON -->
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                    </div>
                    <h3 class="text-xl font-bold mb-4">Değerlerimiz</h3>
                    <p class="text-gray-600">${aboutData.values}</p>
                </div>
            </div>
            <!-- ABOUT_MVV_END -->

            <!-- ABOUT_TEAM_START -->
            <div class="mb-16">
                <h2 class="text-3xl font-bold text-center mb-12">Yönetim Ekibimiz</h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    ${teamHtml}
                </div>
            </div>
            <!-- ABOUT_TEAM_END -->

            <!-- ABOUT_CI_START -->
            <div class="text-center border-t border-gray-200 pt-12">
                <h2 class="text-2xl font-bold mb-6">${aboutData.corporateIdentity.title}</h2>
                <p class="text-gray-600 mb-8 max-w-2xl mx-auto">
                    ${aboutData.corporateIdentity.description}
                </p>
                <a
                    href="${aboutData.corporateIdentity.fileUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-primary transition-colors"
                >
                    <!-- AWARD ICON (Simplified SVG for embedding) -->
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                    ${aboutData.corporateIdentity.buttonText}
                </a>
            </div>
            <!-- ABOUT_CI_END -->
        `;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            // Updated Content logic
            const finalData = { ...formData };
            if (formData.slug === 'reklam') {
                finalData.content = generateAdModelsHtml();
            } else if (formData.slug === 'kunye') {
                finalData.content = generateImprintHtml();
            } else if (formData.slug === 'kariyer') {
                finalData.content = generateCareersHtml();
            } else if (formData.slug === 'iletisim') {
                finalData.content = generateContactHtml();
            } else if (formData.slug === 'hakkimizda') {
                finalData.content = generateAboutHtml();
            }

            if (isEditing) {
                await adminService.updatePage(id, finalData);
            } else {
                await adminService.createPage(finalData);
            }
            setMessage({ type: 'success', text: 'Sayfa başarıyla kaydedildi.' });
            setTimeout(() => navigate('/admin/pages'), 1000);
        } catch (error) {
            console.error('Error saving page:', error);
            setMessage({ type: 'error', text: 'Kaydedilirken hata oluştu.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button onClick={() => navigate('/admin/pages')} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
                        <ArrowLeft size={20} className="mr-1" />
                        <span>Listeye Dön</span>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Sayfayı Düzenle' : 'Yeni Sayfa Ekle'}</h1>
                </div>
                {formData.slug && (
                    <a
                        href={
                            formData.slug === 'reklam' ? '/reklam' :
                                formData.slug === 'iletisim' ? '/iletisim' :
                                    formData.slug === 'hakkimizda' ? '/hakkimizda' :
                                        `/kurumsal/${formData.slug}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Eye size={18} />
                        <span>Önizleme</span>
                    </a>
                )}
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-6">
                    {LOCKED_SLUGS.includes(formData.slug) && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm flex items-center">
                            <AlertTriangle size={18} className="mr-2" />
                            <span>Bu bir sistem sayfasıdır. Başlığı ve adresi değiştirilemez.</span>
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            placeholder="Örn: Hakkımızda"
                            disabled={LOCKED_SLUGS.includes(formData.slug)}
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa URL</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="manual-slug"
                                checked={manualSlug}
                                onChange={(e) => {
                                    setManualSlug(e.target.checked);
                                    if (!e.target.checked) {
                                        setFormData(prev => ({ ...prev, slug: slugify(prev.title) }));
                                    }
                                }}
                                className="w-4 h-4 text-primary rounded border-gray-300 disabled:opacity-50"
                                disabled={LOCKED_SLUGS.includes(formData.slug)}
                            />
                            <label htmlFor="manual-slug" className={`text-sm text-gray-700 cursor-pointer ${LOCKED_SLUGS.includes(formData.slug) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                Manuel URL Belirle
                            </label>
                        </div>
                        {manualSlug && (
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                disabled={LOCKED_SLUGS.includes(formData.slug)}
                            />
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            URL: /kurumsal/{formData.slug || '...'}
                        </p>
                    </div>

                    {/* Ad Models Editor for Reklam Page */}
                    {formData.slug === 'reklam' ? (
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 space-y-6">
                            {/* ... Ad Models UI ... */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Layout size={20} className="text-blue-600" />
                                    Reklam Modelleri Yönetimi
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAdModels([...adModels, {
                                            id: Date.now(),
                                            title: 'Yeni Model',
                                            description: 'Model açıklaması buraya...',
                                            features: ['Özellik 1', 'Özellik 2'],
                                            icon: 'Monitor',
                                            image: ''
                                        }]);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Yeni Model Ekle
                                </button>
                            </div>

                            <div className="space-y-3">
                                <p className="text-sm text-gray-500 bg-white p-3 rounded border border-gray-200">
                                    Bu alandan "Reklam Modellerimiz" bölümündeki kartları düzenleyebilirsiniz.
                                    Yaptığınız değişiklikler otomatik olarak HTML'e çevrilip kaydedilecektir.
                                </p>
                                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-start">
                                    <AlertTriangle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>Bilgi:</strong> Fotoğraf ölçüleri tasarıma göre değişkenlik gösterebilir.
                                        Sisteme istediğiniz ölçüde görsel yükleyebilirsiniz, alanın genişliğine göre otomatik uyarlanacaktır.
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {adModels.map((model, index) => (
                                    <div key={model.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                                                    {index + 1}
                                                </span>
                                                <h4 className="font-bold text-gray-800">{model.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newModels = [...adModels];
                                                        if (index > 0) {
                                                            [newModels[index], newModels[index - 1]] = [newModels[index - 1], newModels[index]];
                                                            setAdModels(newModels);
                                                        }
                                                    }}
                                                    disabled={index === 0}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                                                    title="Yukarı Taşı"
                                                >
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newModels = [...adModels];
                                                        if (index < adModels.length - 1) {
                                                            [newModels[index], newModels[index + 1]] = [newModels[index + 1], newModels[index]];
                                                            setAdModels(newModels);
                                                        }
                                                    }}
                                                    disabled={index === adModels.length - 1}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                                                    title="Aşağı Taşı"
                                                >
                                                    <ArrowDown size={16} />
                                                </button>
                                                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                                <button
                                                    type="button"
                                                    onClick={() => setAdModels(adModels.filter(m => m.id !== model.id))}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Başlık</label>
                                                    <input
                                                        type="text"
                                                        value={model.title}
                                                        onChange={(e) => {
                                                            const newModels = [...adModels];
                                                            newModels[index].title = e.target.value;
                                                            setAdModels(newModels);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                                                        placeholder="Örn: Display Reklamlar"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Görsel</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                id={`upload-${model.id}`}
                                                                className="hidden"
                                                                onChange={(e) => handleImageUpload(index, e.target.files[0])}
                                                                disabled={uploadingImage === index}
                                                            />
                                                            <label
                                                                htmlFor={`upload-${model.id}`}
                                                                className={`flex items-center justify-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${uploadingImage === index ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                title="Resim Yükle"
                                                            >
                                                                {uploadingImage === index ? (
                                                                    <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                                                                ) : (
                                                                    <Upload size={20} className="text-gray-600" />
                                                                )}
                                                            </label>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={model.image || ''}
                                                            onChange={(e) => {
                                                                const newModels = [...adModels];
                                                                newModels[index].image = e.target.value;
                                                                setAdModels(newModels);
                                                            }}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black font-mono text-xs text-gray-600 truncate"
                                                            placeholder="https://... (veya soldan yükle)"
                                                        />
                                                    </div>
                                                    {model.image && (
                                                        <div className="mt-1 ml-1">
                                                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 inline-block max-w-full truncate">
                                                                📁 {model.image.split('/').pop().split('?')[0]}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {model.image && (
                                                        <div className="mt-2 relative h-20 w-full rounded-lg overflow-hidden border border-gray-200 group">
                                                            <img src={model.image} alt="Preview" className="w-full h-full object-cover" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newModels = [...adModels];
                                                                    newModels[index].image = '';
                                                                    setAdModels(newModels);
                                                                }}
                                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Resmi Kaldır"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">İkon (Resim yoksa)</label>
                                                    <select
                                                        value={model.icon}
                                                        onChange={(e) => {
                                                            const newModels = [...adModels];
                                                            newModels[index].icon = e.target.value;
                                                            setAdModels(newModels);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                                                    >
                                                        <option value="Monitor">🖥️ Display / Monitor</option>
                                                        <option value="Users">👥 Sponsorlu / Users</option>
                                                        <option value="Play">▶️ Video / Play</option>
                                                        <option value="Smartphone">📱 Mobil / Smartphone</option>
                                                        <option value="Megaphone">📢 Duyuru / Megaphone</option>
                                                        <option value="Layers">📑 Pop-up / Layers</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Açıklama</label>
                                                    <textarea
                                                        rows="3"
                                                        value={model.description}
                                                        onChange={(e) => {
                                                            const newModels = [...adModels];
                                                            newModels[index].description = e.target.value;
                                                            setAdModels(newModels);
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black resize-none"
                                                        placeholder="Model açıklaması..."
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                                                    Özellikler (Her satıra bir tane)
                                                </label>
                                                <textarea
                                                    rows="8"
                                                    value={model.features.join('\n')}
                                                    onChange={(e) => {
                                                        const newModels = [...adModels];
                                                        newModels[index].features = e.target.value.split('\n');
                                                        setAdModels(newModels);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-black focus:border-black"
                                                    placeholder="• Özellik 1&#10;• Özellik 2&#10;• Özellik 3"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : formData.slug === 'kunye' ? (
                        /* Imprint (Künye) Editor */
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Users size={20} className="text-blue-600" />
                                    Künye Yönetimi
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImprintData([...imprintData, {
                                            id: `imp-${Date.now()}`,
                                            title: 'Yeni Bölüm',
                                            members: [{ id: `m-${Date.now()}`, name: 'İsim Soyisim', role: 'Görevi', email: '' }]
                                        }]);
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Bölüm Ekle
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {imprintData.map((section, sIndex) => (
                                    <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newData = [...imprintData];
                                                    newData[sIndex].title = e.target.value;
                                                    setImprintData(newData);
                                                }}
                                                className="bg-transparent font-bold text-gray-800 border-none focus:ring-0 p-0 w-full"
                                                placeholder="Bölüm Başlığı (Örn: Editörler)"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImprintData(imprintData.filter(s => s.id !== section.id))}
                                                className="text-red-400 hover:text-red-600 p-1"
                                                title="Bölümü Sil"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            {section.members.map((member, mIndex) => (
                                                <div key={member.id} className="flex gap-2 items-start group">
                                                    <div className="flex-1 space-y-2">
                                                        <input
                                                            type="text"
                                                            value={member.name}
                                                            onChange={(e) => {
                                                                const newData = [...imprintData];
                                                                newData[sIndex].members[mIndex].name = e.target.value;
                                                                setImprintData(newData);
                                                            }}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm font-medium placeholder-gray-400"
                                                            placeholder="İsim Soyisim"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={member.role}
                                                            onChange={(e) => {
                                                                const newData = [...imprintData];
                                                                newData[sIndex].members[mIndex].role = e.target.value;
                                                                setImprintData(newData);
                                                            }}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 placeholder-gray-400"
                                                            placeholder="Görevi / Ünvanı"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={member.email}
                                                            onChange={(e) => {
                                                                const newData = [...imprintData];
                                                                newData[sIndex].members[mIndex].email = e.target.value;
                                                                setImprintData(newData);
                                                            }}
                                                            className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-gray-500 placeholder-gray-400 font-mono"
                                                            placeholder="E-posta / Telefon"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newData = [...imprintData];
                                                            newData[sIndex].members = newData[sIndex].members.filter(m => m.id !== member.id);
                                                            setImprintData(newData);
                                                        }}
                                                        className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newData = [...imprintData];
                                                    newData[sIndex].members.push({
                                                        id: `m-${Date.now()}`,
                                                        name: '',
                                                        role: '',
                                                        email: ''
                                                    });
                                                    setImprintData(newData);
                                                }}
                                                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <Plus size={14} /> Kişi Ekle
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : formData.slug === 'kariyer' ? (
                        /* Careers (Kariyer) HTML Editor */
                        /* Careers (Kariyer) Hybrid Editor */
                        <div className="space-y-6">
                            {/* Hero Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Layout size={20} className="text-blue-600" />
                                    Üst Alan (Hero)
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Başlığı</label>
                                        <input
                                            type="text"
                                            value={careersData.heroTitle}
                                            onChange={(e) => setCareersData({ ...careersData, heroTitle: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                                            placeholder="Örn: Kariyer Fırsatları"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama Metni</label>
                                        <textarea
                                            rows="2"
                                            value={careersData.heroDescription}
                                            onChange={(e) => setCareersData({ ...careersData, heroDescription: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black resize-none"
                                            placeholder="Başlık altındaki açıklama yazısı..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Open Positions Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Users size={20} className="text-blue-600" />
                                    Açık Pozisyonlar Bölümü
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bölüm Başlığı</label>
                                    <input
                                        type="text"
                                        value={careersData.positionsTitle}
                                        onChange={(e) => setCareersData({ ...careersData, positionsTitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black mb-4"
                                        placeholder="Örn: Açık Pozisyonlar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">İçerik / Pozisyon Listesi</label>
                                    <textarea
                                        rows="6"
                                        value={careersData.positionsText}
                                        onChange={(e) => setCareersData({ ...careersData, positionsText: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black font-mono text-sm leading-relaxed"
                                        placeholder="Pozisyonları buraya yazınız (HTML kullanabilirsiniz)..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Bu alanda HTML etiketleri (örn: &lt;b&gt;, &lt;br&gt;) kullanabilirsiniz.</p>
                                </div>
                            </div>

                            {/* Extra HTML Editor */}
                            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <code className="text-green-400">&lt;/&gt;</code>
                                        Ekstra HTML Kodları
                                    </h3>
                                    <span className="text-xs text-gray-400 border border-gray-700 px-2 py-1 rounded">
                                        Sayfanın en altına eklenir
                                    </span>
                                </div>

                                <div className="text-gray-400 text-sm mb-2">
                                    Buraya eklediğiniz HTML kodları, yukarıdaki bölümlerin altına, sayfanın sonuna yerleştirilecektir.
                                </div>

                                <textarea
                                    rows="10"
                                    value={careersData.extraHtml}
                                    onChange={(e) => setCareersData({ ...careersData, extraHtml: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-green-400 rounded-lg focus:ring-green-500 focus:border-green-500 font-mono text-sm leading-relaxed"
                                    placeholder="<!-- Özel widget, script veya HTML kodlarınız buraya -->"
                                />
                            </div>
                        </div>
                    ) : formData.slug === 'iletisim' ? (
                        /* Contact (İletişim) Hybrid Editor */
                        <div className="space-y-6">
                            {/* Hero Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Layout size={20} className="text-blue-600" />
                                    Üst Alan (Hero)
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sayfa Başlığı</label>
                                        <input
                                            type="text"
                                            value={contactData.title}
                                            onChange={(e) => setContactData({ ...contactData, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                                            placeholder="Örn: İletişim"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama Metni</label>
                                        <textarea
                                            rows="2"
                                            value={contactData.description}
                                            onChange={(e) => setContactData({ ...contactData, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black resize-none"
                                            placeholder="Başlık altındaki açıklama yazısı..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Users size={20} className="text-blue-600" />
                                    İletişim Bilgileri
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresleri</label>
                                        <textarea
                                            rows="4"
                                            value={contactData.emails}
                                            onChange={(e) => setContactData({ ...contactData, emails: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black font-mono text-sm"
                                            placeholder="Her satıra bir e-posta"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Alt alta yazabilirsiniz.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numaraları</label>
                                        <textarea
                                            rows="4"
                                            value={contactData.phones}
                                            onChange={(e) => setContactData({ ...contactData, phones: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black font-mono text-sm"
                                            placeholder="Her satıra bir numara"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">İlk satır ana numara olur.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                                        <textarea
                                            rows="4"
                                            value={contactData.address}
                                            onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                                            placeholder="Adres bilgisi..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Maps Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    {/* MapIcon placeholder since lucide-react might not have it imported or we can reuse MapPin if available, but MapPin is not imported as MapPin. Let's use generic Layout or similar */}
                                    <Layout size={20} className="text-blue-600" />
                                    Harita (Google Maps)
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Embed Kodu (Iframe)</label>
                                    <textarea
                                        rows="4"
                                        value={contactData.mapsCode}
                                        onChange={(e) => setContactData({ ...contactData, mapsCode: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black font-mono text-xs leading-relaxed"
                                        placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Google Haritalar'dan aldığınız "Haritayı yerleştir" (embed) kodunu buraya yapıştırın.</p>
                                </div>
                            </div>


                            {/* Extra HTML Editor */}
                            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <code className="text-green-400">&lt;/&gt;</code>
                                        Ekstra HTML Kodları
                                    </h3>
                                    <span className="text-xs text-gray-400 border border-gray-700 px-2 py-1 rounded">
                                        Sayfanın en altına eklenir
                                    </span>
                                </div>

                                <div className="text-gray-400 text-sm mb-2">
                                    Buraya eklediğiniz HTML kodları, yukarıdaki bölümlerin altına, sayfanın sonuna yerleştirilecektir.
                                </div>

                                <textarea
                                    rows="10"
                                    value={contactData.extraHtml}
                                    onChange={(e) => setContactData({ ...contactData, extraHtml: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-green-400 rounded-lg focus:ring-green-500 focus:border-green-500 font-mono text-sm leading-relaxed"
                                    placeholder="<!-- Özel widget, script veya HTML kodlarınız buraya -->"
                                />
                            </div>
                        </div>
                    ) : formData.slug === 'hakkimizda' ? (
                        /* About Us (Hakkımızda) Editor */
                        <div className="space-y-6">
                            {/* Hero Section */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">Üst Alan (Hero)</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                    <input
                                        type="text"
                                        value={aboutData.heroTitle}
                                        onChange={(e) => setAboutData({ ...aboutData, heroTitle: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giriş Metni</label>
                                    <textarea
                                        rows="3"
                                        value={aboutData.heroText}
                                        onChange={(e) => setAboutData({ ...aboutData, heroText: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Mission Vision Values */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">Kurumsal Değerler</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Misyonumuz</label>
                                        <textarea
                                            rows="4"
                                            value={aboutData.mission}
                                            onChange={(e) => setAboutData({ ...aboutData, mission: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vizyonumuz</label>
                                        <textarea
                                            rows="4"
                                            value={aboutData.vision}
                                            onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Değerlerimiz</label>
                                        <textarea
                                            rows="4"
                                            value={aboutData.values}
                                            onChange={(e) => setAboutData({ ...aboutData, values: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Team Members */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900">Yönetim Ekibi</h3>
                                    <button
                                        type="button"
                                        onClick={() => setAboutData(prev => ({ ...prev, team: [...prev.team, { name: '', role: '' }] }))}
                                        className="text-sm bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Ekle
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {aboutData.team.map((member, index) => (
                                        <div key={index} className="flex gap-4 items-start bg-white p-3 rounded-lg border border-gray-200">
                                            <div className="flex-1 grid grid-cols-2 gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Ad Soyad"
                                                    value={member.name}
                                                    onChange={(e) => {
                                                        const newTeam = [...aboutData.team];
                                                        newTeam[index].name = e.target.value;
                                                        setAboutData({ ...aboutData, team: newTeam });
                                                    }}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Görevi (Örn: Editör)"
                                                    value={member.role}
                                                    onChange={(e) => {
                                                        const newTeam = [...aboutData.team];
                                                        newTeam[index].role = e.target.value;
                                                        setAboutData({ ...aboutData, team: newTeam });
                                                    }}
                                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newTeam = aboutData.team.filter((_, i) => i !== index);
                                                    setAboutData({ ...aboutData, team: newTeam });
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Corporate Identity */}
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <h3 className="text-lg font-bold text-gray-900">Kurumsal Kimlik Alanı</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                                        <input
                                            type="text"
                                            value={aboutData.corporateIdentity.title}
                                            onChange={(e) => setAboutData({ ...aboutData, corporateIdentity: { ...aboutData.corporateIdentity, title: e.target.value } })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama Metni</label>
                                        <textarea
                                            rows="2"
                                            value={aboutData.corporateIdentity.description}
                                            onChange={(e) => setAboutData({ ...aboutData, corporateIdentity: { ...aboutData.corporateIdentity, description: e.target.value } })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Buton Metni</label>
                                            <input
                                                type="text"
                                                value={aboutData.corporateIdentity.buttonText}
                                                onChange={(e) => setAboutData({ ...aboutData, corporateIdentity: { ...aboutData.corporateIdentity, buttonText: e.target.value } })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Dosya/Link URL</label>
                                            <input
                                                type="text"
                                                value={aboutData.corporateIdentity.fileUrl}
                                                onChange={(e) => setAboutData({ ...aboutData, corporateIdentity: { ...aboutData.corporateIdentity, fileUrl: e.target.value } })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                                placeholder="/kurumsal-kimlik.html"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Standard Content Editor for other pages */
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İçerik</label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(content) => setFormData({ ...formData, content })}
                                placeholder="Sayfa içeriğini buraya yazın..."
                            />
                        </div>
                    )
                    }

                    {/* SEO */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h3 className="font-semibold text-gray-800">SEO Ayarları</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Başlığı</label>
                            <input
                                type="text"
                                value={formData.meta_title}
                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="Google'da görünecek başlık"
                            />
                            <p className="text-xs text-gray-500 mt-1">Sona otomatik olarak " | Site Adı" eklenir.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Açıklaması</label>
                            <textarea
                                rows="2"
                                value={formData.meta_description}
                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                placeholder="Google'da görünecek açıklama"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                            />
                            <span className="text-gray-900 font-medium">Yayında</span>
                        </label>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            <Save size={20} className="mr-2" />
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div >
            </form >
        </div >
    );
};

export default PageEditPage;
