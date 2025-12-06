import React, { useState, useEffect } from 'react';
import { Megaphone, Edit2, Monitor, Smartphone, Layout, CheckCircle, XCircle, Eye, MousePointer2, BarChart2, Plus, Trash2, Home, List, FileText } from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdsPage = () => {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editingAd, setEditingAd] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    // Standard Placements Definition with Dimensions
    const STANDARD_PLACEMENTS = {
        'home_top': { name: 'Ana Sayfa Üst', w: 970, h: 250, mobile: '300x250' },
        'home_top_mobile': { name: 'Ana Sayfa Üst (Mobil)', w: 300, h: 250, mobile: '300x250' },
        'home_list_top': { name: 'Ana Sayfa Liste Üstü', w: 970, h: 250, mobile: '300x250' },
        'home_horizontal': { name: 'Ana Sayfa Yatay', w: 970, h: 250, mobile: '300x250' },
        'home_horizontal_2': { name: 'Ana Sayfa Yatay (2. Yükleme)', w: 970, h: 250, mobile: '300x250' },
        'home_horizontal_3': { name: 'Ana Sayfa Yatay (3. Yükleme)', w: 970, h: 250, mobile: '300x250' },
        'home_horizontal_4': { name: 'Ana Sayfa Yatay (4. Yükleme)', w: 970, h: 250, mobile: '300x250' },
        'category_top': { name: 'Kategori Üst', w: 970, h: 250, mobile: '300x250' },
        'category_horizontal': { name: 'Kategori Yatay', w: 970, h: 250, mobile: '300x250' },
        'category_horizontal_2': { name: 'Kategori Yatay (2. Yükleme)', w: 970, h: 250, mobile: '300x250' },
        'category_horizontal_3': { name: 'Kategori Yatay (3. Yükleme)', w: 970, h: 250, mobile: '300x250' },
        'category_horizontal_4': { name: 'Kategori Yatay (4. Yükleme)', w: 970, h: 250, mobile: '300x250' },
        'sidebar_1': { name: 'Yan Menü 1', w: 300, h: 250, mobile: 'Gizli' },
        'sidebar_2': { name: 'Yan Menü 2', w: 300, h: 250, mobile: 'Gizli' },
        'sidebar_3': { name: 'Yan Menü 3', w: 300, h: 250, mobile: 'Gizli' },
        'sidebar_sticky': { name: 'Yan Menü Yapışkan', w: 300, h: 600, mobile: 'Gizli' },
        'news_content_1': { name: 'Haber İçi', w: 'Responsive', h: 'Auto', mobile: '300x250' },
    };

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAdPlacements();
            setPlacements(data);
        } catch (error) {
            console.error('Error loading ads:', error);
            setMessage({ type: 'error', text: 'Reklam alanları yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isCreating) {
                await adminService.createAdPlacement({
                    name: editingAd.name,
                    placement_code: editingAd.placement_code,
                    type: editingAd.type || 'code',
                    code: editingAd.code,
                    image_url: editingAd.image_url,
                    link_url: editingAd.link_url,
                    rel_attribute: editingAd.rel_attribute || 'nofollow',
                    target_page: editingAd.target_page || 'all',
                    target_category: editingAd.target_category || null,
                    is_active: editingAd.is_active !== false,
                    device_type: editingAd.device_type || 'all',
                    width: editingAd.width || 300,
                    height: editingAd.height || 250
                });
                setMessage({ type: 'success', text: 'Yeni reklam alanı oluşturuldu.' });
            } else {
                await adminService.updateAdPlacement(editingAd.id, {
                    name: editingAd.name,
                    placement_code: editingAd.placement_code,
                    code: editingAd.code,
                    is_active: editingAd.is_active,
                    type: editingAd.type || 'code',
                    image_url: editingAd.image_url,
                    link_url: editingAd.link_url,
                    rel_attribute: editingAd.rel_attribute || 'nofollow',
                    target_page: editingAd.target_page || 'all',
                    target_category: editingAd.target_category || null,
                    device_type: editingAd.device_type || 'all'
                });
                setMessage({ type: 'success', text: 'Reklam alanı güncellendi.' });
            }

            setEditingAd(null);
            setIsCreating(false);
            loadAds();
        } catch (error) {
            console.error('Error saving ad:', error);
            setMessage({ type: 'error', text: 'Kaydetme sırasında hata oluştu.' });
        }
    };

    const startCreate = (prefillPlacementCode = '') => {
        const standard = STANDARD_PLACEMENTS[prefillPlacementCode];
        setEditingAd({
            name: '',
            placement_code: prefillPlacementCode,
            type: 'image',
            device_type: 'all',
            is_active: true,
            width: standard ? standard.w : 300,
            height: standard ? standard.h : 250
        });
        setIsCreating(true);
    };

    const startEdit = (ad) => {
        setEditingAd(ad);
        setIsCreating(false);
    };

    // Helper to find the active ad for a slot
    const getAdForSlot = (code) => {
        // Find ALL ads for this placement
        const ads = placements.filter(p => p.placement_code === code);
        // Determine "Primary" ad logic: 
        // 1. First ACTIVE ad
        // 2. If no active, first PASSIVE ad
        // 3. If none, null
        if (ads.length === 0) return null;

        const activeAd = ads.find(a => a.is_active);
        if (activeAd) return { ...activeAd, count: ads.length }; // Return the active one

        return { ...ads[0], count: ads.length, _allPassive: true }; // Return the first one but mark as all passive
    };

    // --- VISUAL COMPONENTS ---

    const PageTab = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-4 flex items-center justify-center space-x-2 border-b-2 transition-all ${activeTab === id ? 'border-black text-black font-bold bg-gray-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
        >
            <Icon size={20} />
            <span className="text-lg">{label}</span>
        </button>
    );

    const AdSlot = ({ code, h = 'h-24', label, vertical = false }) => {
        const adData = getAdForSlot(code);
        const standard = STANDARD_PLACEMENTS[code];
        const displayLabel = label || (standard ? standard.name : code);
        const dims = standard ? `${standard.w}x${standard.h}` : '?';

        return (
            <div
                onClick={() => adData ? startEdit(adData) : startCreate(code)}
                className={`
                    relative group cursor-pointer transition-all duration-200
                    ${vertical ? 'w-full' : 'w-full'} 
                    ${h}
                    ${adData
                        ? (adData._allPassive
                            ? 'bg-red-50 border-2 border-red-200 hover:border-red-400'
                            : 'bg-green-50 border-2 border-green-200 hover:border-green-400')
                        : 'bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-200'}
                    rounded-lg flex flex-col items-center justify-center text-center p-2
                `}
            >
                {/* Status Indicator */}
                <div className="absolute top-2 right-2">
                    {adData ? (
                        adData._allPassive ? <XCircle size={18} className="text-red-500" /> : <CheckCircle size={18} className="text-green-500" />
                    ) : (
                        <Plus size={18} className="text-gray-400 group-hover:text-gray-600" />
                    )}
                </div>

                {/* Code & Label */}
                <div className="font-mono text-xs text-gray-500 mb-1">{code}</div>
                <div className={`font-bold text-sm ${adData ? 'text-gray-800' : 'text-gray-400'}`}>{displayLabel}</div>

                {/* Dimensions */}
                <div className="text-[10px] text-gray-400 mt-1 bg-white/50 px-2 py-0.5 rounded-full">
                    {dims}
                </div>

                {/* Ad Info (If Exists) */}
                {adData && !adData._allPassive && (
                    <div className="absolute bottom-2 left-0 w-full flex justify-center items-center space-x-3 text-[10px] text-gray-500">
                        <span className="flex items-center"><Eye size={10} className="mr-1" /> {adData.views || 0}</span>
                        <span className="flex items-center"><MousePointer2 size={10} className="mr-1" /> {adData.clicks || 0}</span>
                    </div>
                )}

                {/* Hover Action Text */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {adData ? 'Düzenle' : '+ Oluştur'}
                    </span>
                </div>
            </div>
        );
    };

    const ContentBlock = ({ h = 'h-32', label = 'İçerik Alanı' }) => (
        <div className={`w-full ${h} bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-sm font-medium`}>
            {label}
        </div>
    );

    const SectionHeader = ({ title }) => (
        <div className="w-full bg-black text-white px-4 py-2 rounded-lg text-sm font-bold mb-4 flex items-center justify-between">
            <span>{title}</span>
        </div>
    );

    if (loading && !editingAd) return <div className="p-12 text-center text-gray-500">Yükleniyor...</div>;

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reklam Yerleşimi</h1>
                    <p className="text-gray-500 mt-1">Sitenizdeki reklam alanlarını görsel olarak yönetin.</p>
                </div>
                {message.text && (
                    <div className={`px-4 py-2 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} animate-in fade-in`}>
                        {message.text}
                    </div>
                )}
            </div>

            {/* Main Editor Interface */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <PageTab id="home" label="Ana Sayfa" icon={Home} />
                    <PageTab id="category" label="Kategori Sayfaları" icon={List} />
                    <PageTab id="detail" label="Haber Detay / İçerik" icon={FileText} />
                </div>

                {/* Canvas Area */}
                <div className="bg-gray-50 min-h-[600px] p-8 overflow-y-auto max-h-[calc(100vh-250px)]">
                    <div className="max-w-5xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl p-8 min-h-[800px]">

                        {/* --- HOME LAYOUT --- */}
                        {activeTab === 'home' && (
                            <div className="space-y-6">
                                <SectionHeader title="Header / Navigasyon" />

                                <AdSlot code="home_top" h="h-32" />

                                <div className="flex gap-6">
                                    {/* MAIN CONTENT COLUMN */}
                                    <div className="w-2/3 flex flex-col gap-6">
                                        <div className="h-64 w-full bg-gray-100 rounded flex items-center justify-center text-gray-400 font-bold border border-dashed border-gray-300">
                                            Manşet Slider Alanı
                                        </div>

                                        <AdSlot code="home_horizontal" h="h-28" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <ContentBlock h="h-40" />
                                            <ContentBlock h="h-40" />
                                            <ContentBlock h="h-40" />
                                            <ContentBlock h="h-40" />
                                        </div>

                                        <AdSlot code="home_list_top" h="h-28" />

                                        <div className="space-y-4">
                                            <ContentBlock h="h-24" label="Yatay Haber Kartı" />
                                            <ContentBlock h="h-24" label="Yatay Haber Kartı" />
                                            <ContentBlock h="h-24" label="Yatay Haber Kartı" />
                                        </div>

                                        {/* Infinite Scroll Area */}
                                        <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-6">
                                            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider text-center">Infinite Scroll / Daha Fazla Gör</h3>
                                            <div className="space-y-4">
                                                <AdSlot code="home_horizontal_2" h="h-28" />
                                                <div className="space-y-2 opacity-50"><ContentBlock h="h-24" /><ContentBlock h="h-24" /></div>
                                                <AdSlot code="home_horizontal_3" h="h-28" />
                                                <div className="space-y-2 opacity-50"><ContentBlock h="h-24" /><ContentBlock h="h-24" /></div>
                                                <AdSlot code="home_horizontal_4" h="h-28" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SIDEBAR COLUMN */}
                                    <div className="w-1/3 flex flex-col gap-6">
                                        <AdSlot code="sidebar_1" h="h-64" />
                                        <ContentBlock h="h-48" label="Popüler Widget" />
                                        <AdSlot code="sidebar_2" h="h-64" />
                                        <ContentBlock h="h-64" label="Editörün Seçimi" />
                                        <AdSlot code="sidebar_3" h="h-64" />
                                        <AdSlot code="sidebar_sticky" h="h-[600px]" label="Sticky (Yapışkan)" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- CATEGORY LAYOUT --- */}
                        {activeTab === 'category' && (
                            <div className="space-y-6">
                                <SectionHeader title="Header / Navigasyon" />

                                <div className="flex gap-6">
                                    {/* MAIN CONTENT */}
                                    <div className="w-2/3 flex flex-col gap-6">
                                        <AdSlot code="category_top" h="h-32" />

                                        <div className="h-12 w-full bg-gray-100 rounded border-l-4 border-gray-300 flex items-center pl-4 text-gray-400 font-bold">
                                            Kategori Başlığı (Örn: Gündem)
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <ContentBlock h="h-40" />
                                            <ContentBlock h="h-40" />
                                            <ContentBlock h="h-40" />
                                            <ContentBlock h="h-40" />
                                        </div>

                                        <AdSlot code="category_horizontal" h="h-28" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <ContentBlock h="h-40" />
                                            <ContentBlock h="h-40" />
                                        </div>

                                        {/* Load More Area */}
                                        <div className="border-t-2 border-dashed border-gray-300 pt-6 mt-6">
                                            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider text-center">Infinite Scroll / Daha Fazla Gör</h3>
                                            <div className="space-y-4">
                                                <AdSlot code="category_horizontal_2" h="h-28" />
                                                <div className="grid grid-cols-2 gap-4 opacity-50"><ContentBlock h="h-40" /><ContentBlock h="h-40" /></div>
                                                <AdSlot code="category_horizontal_3" h="h-28" />
                                                <div className="grid grid-cols-2 gap-4 opacity-50"><ContentBlock h="h-40" /><ContentBlock h="h-40" /></div>
                                                <AdSlot code="category_horizontal_4" h="h-28" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* SIDEBAR */}
                                    <div className="w-1/3 flex flex-col gap-6">
                                        <AdSlot code="sidebar_1" h="h-64" />
                                        <ContentBlock h="h-48" label="Popüler Haberler" />
                                        <AdSlot code="sidebar_2" h="h-64" />
                                        <ContentBlock h="h-64" label="Çok Okunanlar" />
                                        <AdSlot code="sidebar_3" h="h-64" />
                                        <AdSlot code="sidebar_sticky" h="h-[600px]" label="Sticky (Yapışkan)" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- DETAIL LAYOUT --- */}
                        {activeTab === 'detail' && (
                            <div className="space-y-6">
                                <SectionHeader title="Header / Navigasyon" />

                                <div className="flex gap-6">
                                    {/* MAIN CONTENT */}
                                    <div className="w-2/3 flex flex-col gap-6">
                                        <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-96 w-full bg-gray-200 rounded flex items-center justify-center text-gray-400 font-bold">Haber Görseli</div>

                                        <div className="space-y-4 text-gray-300">
                                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                                            <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                                        </div>

                                        <div className="bg-red-50 border-2 border-red-200 border-dashed rounded-lg h-48 flex items-center justify-center mb-6">
                                            <div className="text-red-400 font-bold flex flex-col items-center">
                                                <span className="text-3xl mb-2">▶</span>
                                                <span>Haber Videosu (Varsa)</span>
                                            </div>
                                        </div>

                                        <AdSlot code="news_content_1" h="h-48" label="Haber İçeriği Arası (2. Paragraf)" />

                                        <div className="space-y-4 text-gray-300">
                                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                                            <div className="h-4 w-full bg-gray-100 rounded"></div>
                                            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                                        </div>
                                    </div>

                                    {/* SIDEBAR */}
                                    <div className="w-1/3 flex flex-col gap-6">
                                        <div className="p-4 border border-dashed rounded bg-gray-50">
                                            <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Benzer Haberler Grid</div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <ContentBlock h="h-32" />
                                                <ContentBlock h="h-32" />
                                                <ContentBlock h="h-32" />
                                                <ContentBlock h="h-32" />
                                                <ContentBlock h="h-32" />
                                                <ContentBlock h="h-32" />
                                                <ContentBlock h="h-32" />
                                                <ContentBlock h="h-32" />
                                                <div className="col-span-2">
                                                    <AdSlot code="sidebar_1" h="h-64" label="Grid İçi (4. sıradan sonra)" />
                                                    <p className="text-center text-gray-400 mt-8 text-sm">
                                                        * Düzenlemek istediğiniz reklam alanına tıklayınız. Yeşil alanlar aktif reklamları gösterir.
                                                    </p>
                                                </div>
                                                <ContentBlock h="h-32" />
                                                <ContentBlock h="h-32" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                    <p className="text-center text-gray-400 mt-8 text-sm">
                        * Düzenlemek istediğiniz reklam alanına tıklayınız. Yeşil alanlar aktif reklamları gösterir.
                    </p>
                </div>
            </div>

            {/* Edit/Create Modal */}
            {editingAd && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-900">
                                {isCreating ? 'Yeni Reklam Ekle' : `Reklam Düzenle: ${editingAd.name}`}
                            </h3>
                            <button onClick={() => setEditingAd(null)} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {/* Hidden Fields */}
                            <input type="hidden" value={editingAd.placement_code} />

                            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center space-x-3 mb-4">
                                <Layout className="text-blue-500" />
                                <div>
                                    <span className="block text-xs text-blue-400 uppercase font-bold">Seçilen Alan</span>
                                    <span className="font-bold text-blue-900">{(STANDARD_PLACEMENTS[editingAd.placement_code]?.name) || editingAd.placement_code}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Reklam Adı (Tanımlayıcı)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                    placeholder="Örn: Nike Kış Kampanyası"
                                    value={editingAd.name}
                                    onChange={(e) => setEditingAd({ ...editingAd, name: e.target.value })}
                                />
                            </div>

                            {/* Ad Type Toggle */}
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setEditingAd({ ...editingAd, type: 'code' })}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${editingAd.type !== 'image' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Kod (HTML/JS)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingAd({ ...editingAd, type: 'image' })}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${editingAd.type === 'image' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Görsel (JPG/PNG)
                                </button>
                            </div>

                            {editingAd.type === 'image' ? (
                                <div className="space-y-4 animate-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                            placeholder="https://example.com/banner.jpg"
                                            value={editingAd.image_url || ''}
                                            onChange={(e) => setEditingAd({ ...editingAd, image_url: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Yönlendirilecek Link</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                            placeholder="https://hedef-site.com"
                                            value={editingAd.link_url || ''}
                                            onChange={(e) => setEditingAd({ ...editingAd, link_url: e.target.value })}
                                        />
                                    </div>
                                    {editingAd.image_url && (
                                        <div className="mt-2 p-2 border border-dashed rounded bg-gray-50 text-center">
                                            <img src={editingAd.image_url} alt="Önizleme" className="max-h-32 mx-auto object-contain" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="animate-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reklam Kodu (HTML/JS)</label>
                                    <textarea
                                        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black font-mono text-sm"
                                        placeholder="<script>...</script>"
                                        value={editingAd.code || ''}
                                        onChange={(e) => setEditingAd({ ...editingAd, code: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Options */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Cihaz</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        value={editingAd.device_type || 'all'}
                                        onChange={(e) => setEditingAd({ ...editingAd, device_type: e.target.value })}
                                    >
                                        <option value="all">Tüm Cihazlar</option>
                                        <option value="desktop">Sadece Masaüstü</option>
                                        <option value="mobile">Sadece Mobil</option>
                                    </select>
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={editingAd.is_active}
                                            onChange={(e) => setEditingAd({ ...editingAd, is_active: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-700">Aktif</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-6 border-t border-gray-100">
                                <button type="button" onClick={() => setEditingAd(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Vazgeç</button>
                                <button type="submit" className="flex-1 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdsPage;
