import React, { useState, useEffect } from 'react';
import { GripVertical, X, Lock, Megaphone, Layers, Info } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { fetchHeadlines, fetchSurmanset } from '../../services/api';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/slugify';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

const HeadlinesPage = () => {
    const [activeTab, setActiveTab] = useState(1); // 1: Main Headline, 2: Manşet 2
    const [headlines, setHeadlines] = useState([]);
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
            if (activeTab === 1) {
                // Manşet 1 Data
                try {
                    await adminService.getHeadlineAds();
                    await adminService.getHeadlineSliderAds();
                } catch (e) {
                    console.warn('Ads check failed:', e);
                }
            }

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
                const headline = manualData.find(h => h.News?.id === item.id);

                if (headline) {
                    await adminService.removeFromHeadline(headline.order_index, activeTab);

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
        // Allow dragging EVERYTHING to support pinning automatic items

        const items = [...headlines];
        const item = items[draggedIndex];

        items.splice(draggedIndex, 1);
        items.splice(index, 0, item);

        setHeadlines(items);
        setDraggedIndex(index);
    };

    const handlePin = async (item, slotIndex) => {
        try {
            const slotNumber = slotIndex + 1;
            // Pin as manual headline
            await adminService.addToHeadline(item.id, slotNumber, activeTab);

            // Also update the news item itself to have is_headline true 
            const updatePayload = activeTab === 1 ? { is_slider: true } : { is_manset_2: true };
            await adminService.updateNews(item.id, updatePayload);

            setMessage({ type: 'success', text: `${slotNumber}. sıraya sabitlendi.` });
            loadHeadlines();
        } catch (error) {
            console.error('Error pinning:', error);
            setMessage({ type: 'error', text: 'Sabitleme hatası.' });
        }
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
                const isSliderAd = item.type === 'slider-ad';
                const isAd = item.type === 'ad';
                const isManual = item.isManual && item.type === 'news';

                if (isSliderAd) {
                    const adPlacementId = item.adPlacementId || item.id;
                    const existing = sliderAdData.find(ad => ad.id === adPlacementId);
                    const currentSlot = activeTab === 1 ? existing?.headline_slot : existing?.manset_2_slot;

                    if (existing && currentSlot !== targetSlot) {
                        if (activeTab === 1) {
                            await adminService.setAdPlacementHeadlineSlot(adPlacementId, targetSlot);
                        } else {
                            await adminService.setAdManset2Slot(adPlacementId, targetSlot);
                        }
                    }
                } else if (isAd) {
                    const adId = item.adId || item.id;
                    const existing = adData.find(ad => ad.id === adId);
                    const currentSlot = activeTab === 1 ? existing?.headline_slot : existing?.manset_2_slot;

                    if (existing && currentSlot !== targetSlot) {
                        if (activeTab === 1) {
                            await adminService.setAdHeadlineSlot(adId, targetSlot);
                        } else {
                            await adminService.setAdManset2Slot(adId, targetSlot);
                        }
                    }
                } else if (isManual || item.type === 'news') {
                    const existing = manualData.find(h => h.News?.id === item.id);
                    if (!existing || existing.order_index !== targetSlot) {
                        // If it was pinned elsewhere, remove that pin first
                        if (existing) {
                            await adminService.removeFromHeadline(existing.order_index, activeTab);
                        }
                        // Pin to the new slot
                        await adminService.addToHeadline(item.id, targetSlot, activeTab);

                        // Also ensure the news record is marked as slider/manset2
                        const updatePayload = activeTab === 1 ? { is_slider: true } : { is_manset_2: true };
                        await adminService.updateNews(item.id, updatePayload);
                    }
                }
            }

            setMessage({ type: 'success', text: 'Sıralama kaydedildi.' });
            setTimeout(() => loadHeadlines(), 1500);
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
                            const isManual = headline.isManual && headline.type === 'news';
                            const isSliderAd = headline.type === 'slider-ad';
                            const isAd = headline.type === 'ad';
                            const isDraggable = !!headline.id; // Allow dragging any valid item
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
                                        src={getOptimizedImageUrl(headline.image_url)}
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
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                        Otomatik
                                                    </span>
                                                    <button
                                                        onClick={() => handlePin(headline, index)}
                                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                                                        title="Bu sıraya sabitle"
                                                    >
                                                        <Lock size={12} />
                                                        Sabitle
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemove(headline)}
                                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title={isManual || isAd || isSliderAd ? "Sabit Kaldır" : "Görünümden Kaldır"}
                                    >
                                        <X size={20} />
                                    </button>
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
