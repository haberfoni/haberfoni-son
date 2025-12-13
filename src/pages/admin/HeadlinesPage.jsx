import React, { useState, useEffect } from 'react';
import { GripVertical, X, Lock, Megaphone, Layers, Info } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { fetchHeadlines, fetchSurmanset } from '../../services/api';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/slugify';

const HeadlinesPage = () => {
    const [activeTab, setActiveTab] = useState(1); // 1: Main Headline, 2: Manşet 2
    const [headlines, setHeadlines] = useState([]);
    const [manualHeadlineIds, setManualHeadlineIds] = useState(new Set());
    const [adIds, setAdIds] = useState(new Set());
    const [sliderAdIds, setSliderAdIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [allSliderAds, setAllSliderAds] = useState([]);

    useEffect(() => {
        loadHeadlines();
    }, [activeTab]);

    const loadHeadlines = async () => {
        try {
            setLoading(true);
            setHeadlines([]); // Clear prev data immediately

            const manualData = await adminService.getHeadlines(activeTab);
            const manualIds = new Set(manualData.map(h => h.news?.id).filter(Boolean));
            setManualHeadlineIds(manualIds);

            let headlineAds = [];
            let sliderAds = [];

            if (activeTab === 1) {
                // Manşet 1 Data
                headlineAds = await adminService.getHeadlineAds();
                try {
                    sliderAds = await adminService.getHeadlineSliderAds();
                } catch (sliderError) {
                    console.warn('Slider ads not available:', sliderError);
                }
            } else {
                // Manşet 2 Data
                headlineAds = await adminService.getManset2Ads();
                try {
                    sliderAds = await adminService.getManset2SliderAds();
                } catch (sliderError) {
                    console.warn('Slider ads not available for Manset 2:', sliderError);
                }
            }

            const adIdsSet = new Set(headlineAds.map(ad => `ad-${ad.id}`));
            setAdIds(adIdsSet);

            const sliderAdIdsSet = new Set(sliderAds.map(ad => `slider-ad-${ad.id}`));
            setSliderAdIds(sliderAdIdsSet);
            setAllSliderAds(sliderAds);

            // Fetch Preview Data
            let allHeadlines = [];
            if (activeTab === 1) {
                allHeadlines = await fetchHeadlines();
            } else {
                allHeadlines = await fetchSurmanset();
            }

            setHeadlines(allHeadlines);
        } catch (error) {
            console.error('Error loading headlines:', error);
            setMessage({ type: 'error', text: 'Manşetler yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (item) => {
        const isSliderAd = item.type === 'slider-ad';
        const isAd = item.type === 'ad';
        const confirmMsg = (isAd || isSliderAd) ? 'Bu reklamı manşetten kaldırmak istediğinizden emin misiniz?' : 'Bu haberi manşetten kaldırmak istediğinizden emin misiniz?';

        if (!window.confirm(confirmMsg)) return;

        try {
            if (isSliderAd) {
                // For Manşet 1, we nullify headline_slot. For Manşet 2? 
                // Slider ads usually have their own method or share logic.
                // Assuming 'removeAdPlacementFromHeadline' handles Manşet 1. We might create 'removeAdPlacementFromManset2'.
                // But wait! adminService methods for removing ads typically nullify 'headline_slot'.
                // We need to nullify 'manset_2_slot' if Tab 2.

                if (activeTab === 1) {
                    await adminService.setAdPlacementHeadlineSlot(item.adPlacementId, null);
                } else {
                    await adminService.setAdManset2Slot(item.adPlacementId, null);
                }

                setMessage({ type: 'success', text: 'Slider reklamı manşetten kaldırıldı.' });
            } else if (isAd) {
                if (activeTab === 1) {
                    await adminService.setAdHeadlineSlot(item.adId, null);
                } else {
                    await adminService.setAdManset2Slot(item.adId, null);
                }
                setMessage({ type: 'success', text: 'Reklam manşetten kaldırıldı.' });
            } else {
                // Manual News
                const manualData = await adminService.getHeadlines(activeTab);
                const headline = manualData.find(h => h.news?.id === item.id);

                if (headline) {
                    await adminService.removeFromHeadline(headline.slot_number, activeTab);

                    // Toggle boolean in news table
                    const updatePayload = activeTab === 1 ? { is_slider: false } : { is_manset_2: false };
                    await adminService.updateNews(item.id, updatePayload);

                    setMessage({ type: 'success', text: 'Haber manşetten kaldırıldı.' });
                }
            }
            loadHeadlines();
        } catch (error) {
            console.error('Error removing:', error);
            setMessage({ type: 'error', text: 'Kaldırma işlemi başarısız.' });
        }
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === index) return;

        const draggedItem = headlines[draggedIndex];
        // Only allow dragging manual headlines, ads, and slider ads
        if (!manualHeadlineIds.has(draggedItem.id) && !adIds.has(draggedItem.id) && !sliderAdIds.has(draggedItem.id)) return;

        const items = [...headlines];
        const item = items[draggedIndex];

        items.splice(draggedIndex, 1);
        items.splice(index, 0, item);

        setHeadlines(items);
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        if (draggedIndex === null) return;

        // Optimistic UI updated, now save
        const itemsToSave = [...headlines];
        // Only saving dragged items or ensuring slots are correct for manually assigned ones.

        try {
            const manualData = await adminService.getHeadlines(activeTab);
            let adData = [];
            let sliderAdData = [];

            if (activeTab === 1) {
                adData = await adminService.getHeadlineAds();
                sliderAdData = await adminService.getHeadlineSliderAds();
            } else {
                adData = await adminService.getManset2Ads();
                sliderAdData = await adminService.getManset2SliderAds();
            }

            // Calculate slot numbers based on visual position
            for (let i = 0; i < itemsToSave.length; i++) {
                const item = itemsToSave[i];
                const targetSlot = i + 1;

                // Determine Item Type
                const isSliderAd = sliderAdIds.has(item.id);
                const isAd = adIds.has(item.id);
                const isManual = manualHeadlineIds.has(item.id);

                if (isSliderAd) {
                    const existing = sliderAdData.find(ad => ad.id === item.adPlacementId);
                    const currentSlot = activeTab === 1 ? existing?.headline_slot : existing?.manset_2_slot;

                    if (existing && currentSlot !== targetSlot) {
                        if (activeTab === 1) {
                            await adminService.setAdPlacementHeadlineSlot(item.adPlacementId, targetSlot);
                        } else {
                            await adminService.setAdManset2Slot(item.adPlacementId, targetSlot);
                        }
                    }
                } else if (isAd) {
                    const existing = adData.find(ad => ad.id === item.adId);
                    const currentSlot = activeTab === 1 ? existing?.headline_slot : existing?.manset_2_slot;

                    if (existing && currentSlot !== targetSlot) {
                        if (activeTab === 1) {
                            await adminService.setAdHeadlineSlot(item.adId, targetSlot);
                        } else {
                            await adminService.setAdManset2Slot(item.adId, targetSlot);
                        }
                    }
                } else if (isManual) {
                    const existing = manualData.find(h => h.news?.id === item.id);
                    if (existing && existing.slot_number !== targetSlot) {
                        await adminService.removeFromHeadline(existing.slot_number, activeTab);
                        await adminService.addToHeadline(item.id, targetSlot, activeTab);
                    }
                }
            }

            setMessage({ type: 'success', text: 'Sıralama kaydedildi.' });
            setTimeout(() => loadHeadlines(), 300);
        } catch (error) {
            console.error('Error saving order:', error);
            setMessage({ type: 'error', text: 'Sıralama kaydedilemedi.' });
            loadHeadlines();
        }

        setDraggedIndex(null);
    };

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Megaphone className="text-black" />
                    Manşet Yönetimi
                </h1>
                <p className="text-gray-500 text-sm mt-2">
                    Manşet ve Sürmanşet alanlarını buradan yönetin. Haberleri sürükleyerek sıralayabilirsiniz.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab(1)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 1
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Layers size={18} />
                    Manşet 1 (Ana Slider)
                </button>
                <button
                    onClick={() => setActiveTab(2)}
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 2
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Layers size={18} />
                    Manşet 2 (Sürmanşet)
                </button>
            </div>

            {/* Active Tab Info */}
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div className="ml-3">
                        <p className="text-sm text-blue-700 font-medium">
                            Şu an düzenleniyor: {activeTab === 1 ? 'Ana Manşet Slider' : 'Manşet 2 (Sağ Liste + Büyük Görsel)'}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            {activeTab === 1
                                ? 'Ana sayfadaki en büyük slider alanı.'
                                : 'Haber listesinin üstündeki (MedyaRadar tarzı) alan.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Ads Warning */}
            <div className={`mb-6 p-4 rounded border-l-4 ${activeTab === 1 ? 'bg-orange-50 border-orange-400' : 'bg-purple-50 border-purple-400'}`}>
                <div className="flex items-start">
                    <Megaphone className={`h-5 w-5 ${activeTab === 1 ? 'text-orange-400' : 'text-purple-400'} mt-0.5`} />
                    <div className="ml-3">
                        <p className={`text-sm ${activeTab === 1 ? 'text-orange-700' : 'text-purple-700'}`}>
                            <strong>🎯 {activeTab === 1 ? 'Manşet 1' : 'Manşet 2'} Slider Reklamları:</strong>
                            Reklam Yönetimi sayfasından
                            <strong> "{activeTab === 1 ? 'Manşet 1 Slider Alanı' : 'Manşet 2 Slider Alanı'}" </strong>
                            seçerek eklediğiniz reklamlar burada görünür.
                        </p>
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">Mevcut Sıralama ({headlines.length}/15)</h2>
                    <span className="text-sm text-gray-500">Öğeleri sürükleyerek sıralayın</span>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
                ) : headlines.length === 0 ? (
                    <div className="text-center py-12">
                        <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2">Bu alanda henüz içerik yok</p>
                        <p className="text-sm text-gray-400">
                            Haber detay sayfasından veya Reklam yönetiminden ekleme yapabilirsiniz.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {headlines.map((headline, index) => {
                            const isManual = manualHeadlineIds.has(headline.id);
                            const isSliderAd = sliderAdIds.has(headline.id);
                            const isAd = adIds.has(headline.id);
                            const isDraggable = isManual || isSliderAd || isAd;
                            const isDragging = draggedIndex === index;

                            return (
                                <div
                                    key={headline.id || index}
                                    draggable={isDraggable}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${isDraggable
                                        ? `cursor-move ${isDragging ? 'opacity-50 bg-gray-100 scale-95' : 'hover:bg-gray-50 hover:shadow-md'}`
                                        : 'bg-gray-50/50 cursor-default'
                                        }`}
                                >
                                    {isDraggable && (
                                        <div className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                                            <GripVertical size={20} />
                                        </div>
                                    )}

                                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm">
                                        {index + 1}
                                    </div>

                                    <img
                                        src={headline.image_url}
                                        alt={headline.title}
                                        className="w-32 h-20 object-cover rounded"
                                    />

                                    <div className="flex-1">
                                        {(headline.type === 'ad' || headline.type === 'slider-ad') ? (
                                            <a
                                                href={headline.link_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:text-primary line-clamp-2 mb-1 block"
                                            >
                                                {headline.title || headline.name}
                                            </a>
                                        ) : (
                                            <Link
                                                to={`/kategori/${slugify(headline.category)}/${headline.slug || slugify(headline.title)}`}
                                                target="_blank"
                                                className="font-medium hover:text-primary line-clamp-2 mb-1 block"
                                            >
                                                {headline.title}
                                            </Link>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-500">
                                                {headline.category || 'Reklam'}
                                                • {headline.views || 0} görüntülenme
                                                {(headline.type === 'ad' || headline.type === 'slider-ad') && (
                                                    <span> • {headline.clicks || 0} tıklama</span>
                                                )}
                                            </p>

                                            {/* Labels */}
                                            {headline.type === 'slider-ad' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                    🎯 Slider Reklamı
                                                </span>
                                            ) : headline.type === 'ad' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                                                    🎯 Reklam
                                                </span>
                                            ) : isManual ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                                    <Lock size={12} />
                                                    Sabit
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                    Otomatik
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {isDraggable && (
                                        <button
                                            onClick={() => handleRemove(headline)}
                                            className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Manşetten Kaldır"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HeadlinesPage;
