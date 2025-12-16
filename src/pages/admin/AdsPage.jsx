import React, { useState, useEffect } from 'react';
import { Megaphone, Edit2, Monitor, Smartphone, Layout, CheckCircle, XCircle, Eye, MousePointer2, BarChart2, Plus, Trash2, Home, List, FileText, Upload, Loader, EyeOff, ArrowUpDown, ArrowUp, ArrowDown, LayoutTemplate, PlusCircle, Edit, GripVertical, Move } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchCategories } from '../../services/api';
import { supabase } from '../../services/supabase';
import { slugify } from '../../utils/slugify';

const AdsPage = () => {
    const [placements, setPlacements] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategorySlugs, setActiveCategorySlugs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editingAd, setEditingAd] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [showEmptyAds, setShowEmptyAds] = useState(true);
    const [showSponsoredLabel, setShowSponsoredLabel] = useState(true);
    const { reloadSettings } = useSiteSettings();

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'views', direction: 'desc' });
    const [selectedReportIds, setSelectedReportIds] = useState([]);

    const toggleReportSelection = (id) => {
        setSelectedReportIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAllReports = () => {
        if (selectedReportIds.length === placements.length) {
            setSelectedReportIds([]);
        } else {
            setSelectedReportIds(placements.map(p => p.id));
        }
    };

    const handleDeleteSelectedReports = async () => {
        if (selectedReportIds.length === 0) return;
        if (!window.confirm(`${selectedReportIds.length} adet reklamı silmek istediğinize emin misiniz?`)) return;

        try {
            setLoading(true);
            // Delete sequentially or via bulk API if available (simulating sequential for safety)
            for (const id of selectedReportIds) {
                await adminService.deleteAdPlacement(id);
            }
            setPlacements(prev => prev.filter(p => !selectedReportIds.includes(p.id)));
            setSelectedReportIds([]);
            setMessage({ type: 'success', text: 'Seçilen reklamlar silindi.' });
        } catch (error) {
            console.error('Error deleting reports:', error);
            setMessage({ type: 'error', text: 'Silme işleminde hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    // Standard Placements Definition with Dimensions
    const BASE_PLACEMENTS = {
        'manset_2_slider': { name: 'Manşet 2 Slider Alanı (Sürmanşet)', w: 1200, h: 600, mobile: '100%x400' },
        'headline_slider': { name: 'Manşet 1 Slider Alanı (Ana Manşet)', w: 1200, h: 600, mobile: '100%x400' },
        'home_top': { name: 'Ana Sayfa Üst', w: 970, h: 250, mobile: '300x250' },
        'home_top_mobile': { name: 'Ana Sayfa Üst (Mobil)', w: 300, h: 250, mobile: '300x250' },
        'home_between_mansets': { name: 'Manşetler Arası Reklam', w: 970, h: 250, mobile: '300x250' },
        'home_breaking_news_sidebar_1': { name: 'Ana Sayfa Son Dakika Yan Reklam 1', w: 300, h: 250, mobile: '300x250' },
        'home_breaking_news_sidebar_2': { name: 'Ana Sayfa Son Dakika Yan Reklam 2', w: 300, h: 250, mobile: '300x250' },
        'home_breaking_news_sidebar_3': { name: 'Ana Sayfa Son Dakika Yan Reklam 3', w: 300, h: 250, mobile: '300x250' },
        'home_surmanset_sidebar_1': { name: 'Ana Sayfa Sürmanşet Yan Reklam 1', w: 300, h: 250, mobile: '300x250' },
        'home_surmanset_sidebar_2': { name: 'Ana Sayfa Sürmanşet Yan Reklam 2', w: 300, h: 250, mobile: '300x250' },
        'home_surmanset_sidebar_3': { name: 'Ana Sayfa Sürmanşet Yan Reklam 3', w: 300, h: 250, mobile: '300x250' },
        'home_list_top': { name: 'Ana Sayfa Liste Üstü', w: 970, h: 250, mobile: '300x250' },
        'home_multimedia_bottom': { name: 'Ana Sayfa Multimedya Altı', w: 970, h: 250, mobile: '300x250' },
        'home_horizontal': { name: 'Ana Sayfa Yatay', w: 970, h: 250, mobile: '300x250' },

        'category_top': { name: 'Kategori Üst', w: 970, h: 250, mobile: '300x250' },
        'category_horizontal': { name: 'Kategori Yatay', w: 970, h: 250, mobile: '300x250' },
        'category_horizontal_2': { name: 'Kategori Yatay (2. Yükleme)', w: 970, h: 250, mobile: '300x250' },
        'category_horizontal_3': { name: 'Kategori Yatay (3. Yükleme)', w: 970, h: 250, mobile: '300x250' },
        'category_horizontal_4': { name: 'Kategori Yatay (4. Yükleme)', w: 970, h: 250, mobile: '300x250' },

        'category_sidebar_1': { name: 'Kategori Yan Menü 1', w: 300, h: 250, mobile: 'Gizli' },
        'category_sidebar_2': { name: 'Kategori Yan Menü 2', w: 300, h: 250, mobile: 'Gizli' },
        'category_sidebar_3': { name: 'Kategori Yan Menü 3', w: 300, h: 250, mobile: 'Gizli' },
        'category_sidebar_sticky': { name: 'Kategori Yan Menü Yapışkan', w: 300, h: 600, mobile: 'Gizli' },
        'news_sidebar_1': { name: 'Haber Detay Yan Menü 1', w: 300, h: 250, mobile: 'Gizli' },
        'news_sidebar_2': { name: 'Haber Detay Yan Menü 2', w: 300, h: 250, mobile: 'Gizli' },
        'news_sidebar_3': { name: 'Haber Detay Yan Menü 3', w: 300, h: 250, mobile: 'Gizli' },
        'news_sidebar_sticky': { name: 'Haber Detay Yan Menü Yapışkan', w: 300, h: 600, mobile: 'Gizli' },
        'news_content_1': { name: 'Haber İçi', w: 'Responsive', h: 'Auto', mobile: '300x250' },
        'site_popup': { name: 'Açılır Popup (Site Giriş)', w: 800, h: 600, mobile: '300x400' },
        'site_header_top': { name: 'Site Üstü Duyuru Bantı', w: 'Full', h: 40, mobile: 'Responsive' },
    };

    // Dynamically merge categories into placements
    // Only include categories that are ACTIVE on the homepage (enabled in layout & has >= 4 news)
    const STANDARD_PLACEMENTS = { ...BASE_PLACEMENTS };
    categories.forEach(cat => {
        if (activeCategorySlugs.includes(cat.slug)) {
            const slug = cat.slug;
            const displayName = cat.name;
            STANDARD_PLACEMENTS[`home_${slug}_sidebar_1`] = { name: `Ana Sayfa ${displayName} Yan Reklam 1`, w: 300, h: 250, mobile: '300x250' };
            STANDARD_PLACEMENTS[`home_${slug}_sidebar_2`] = { name: `Ana Sayfa ${displayName} Yan Reklam 2`, w: 300, h: 250, mobile: '300x250' };
            STANDARD_PLACEMENTS[`home_${slug}_sidebar_3`] = { name: `Ana Sayfa ${displayName} Yan Reklam 3`, w: 300, h: 250, mobile: '300x250' };
        }
    });

    useEffect(() => {
        loadSettings();
        loadData();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await adminService.getSettings();
            setShowEmptyAds(settings.show_empty_ads !== 'false');
            setShowSponsoredLabel(settings.show_sponsored_label !== 'false');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);
            const [adsData, categoriesData, layoutData, newsData] = await Promise.all([
                adminService.getAdPlacements(),
                fetchCategories(),
                adminService.getHomeLayout(),
                supabase.from('news').select('category') // Fetch minimal data for counting
            ]);

            setPlacements(adsData);
            setCategories(categoriesData);

            // Calculate news counts per category
            const newsCounts = {};
            if (newsData.data) {
                newsData.data.forEach(item => {
                    const catSlug = slugify(item.category || '');
                    newsCounts[catSlug] = (newsCounts[catSlug] || 0) + 1;

                    // Also count exact match just in case
                    if (item.category) {
                        newsCounts[item.category] = (newsCounts[item.category] || 0) + 1;
                    }
                });
            }

            // check Home Layout config
            const layoutConfig = layoutData?.categoryConfig || [];

            // Determine active categories
            // Rules:
            // 1. Must be enabled in Home Layout (or if no config for it, assume enabled by default?)
            //    Correct logic: If config exists, check enabled. If not in config, it might be new.
            //    But for HomePage.jsx, we see it renders active ones.
            // 2. Must have >= 4 news.

            const activeSlugs = categoriesData.map(cat => cat.slug).filter(slug => {
                const configItem = layoutConfig.find(c => c.id === slug);
                const isEnabledInLayout = configItem ? configItem.enabled : true; // Default to true if not configured yet

                // Get count (try slug, try name)
                const catName = categoriesData.find(c => c.slug === slug)?.name;
                const count = (newsCounts[slug] || 0) + (newsCounts[slugify(catName || '')] || 0);
                // Note: The double counting logic above is imperfect but ensures we catch matches. 
                // Ideally we should use a map. simplified:
                const effectiveCount = newsCounts[slug] || newsCounts[catName] || 0;

                // To be safe with the loose matching:
                // If news.category stores 'Gündem', slug is 'gundem'.

                return isEnabledInLayout && effectiveCount >= 4;
            });

            // Sort activeSlugs based on layoutConfig order
            activeSlugs.sort((a, b) => {
                const indexA = layoutConfig.findIndex(c => c.id === a);
                const indexB = layoutConfig.findIndex(c => c.id === b);

                // If both are in config, sort by index
                if (indexA !== -1 && indexB !== -1) return indexA - indexB;

                // If one is in config, it comes first
                if (indexA !== -1) return -1;
                if (indexB !== -1) return 1;

                // If neither, keep original order (or alphabetical)
                return 0;
            });

            setActiveCategorySlugs(activeSlugs);

        } catch (error) {
            console.error('Error loading data:', error);
            setMessage({ type: 'error', text: 'Veriler yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const toggleEmptyAds = async () => {
        try {
            const newValue = !showEmptyAds;
            setShowEmptyAds(newValue);
            await adminService.updateSetting('show_empty_ads', newValue.toString());
            await reloadSettings();
            setMessage({ type: 'success', text: `Boş reklam alanları ${newValue ? 'gösterilecek' : 'gizlenecek'}.` });
        } catch (error) {
            console.error('Error updating setting:', error);
            setMessage({ type: 'error', text: 'Ayar güncellenirken hata oluştu.' });
            setShowEmptyAds(!showEmptyAds);
        }
    };

    const toggleSponsoredLabel = async () => {
        try {
            const newValue = !showSponsoredLabel;
            setShowSponsoredLabel(newValue);
            await adminService.updateSetting('show_sponsored_label', newValue.toString());
            await reloadSettings();
            setMessage({ type: 'success', text: `Sponsorlu etiketi ${newValue ? 'gösterilecek' : 'gizlenecek'}.` });
        } catch (error) {
            console.error('Error updating setting:', error);
            setMessage({ type: 'error', text: 'Ayar güncellenirken hata oluştu.' });
            setShowSponsoredLabel(!showSponsoredLabel);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadError(null);

        if (file.size > 1024 * 1024) {
            setUploadError('Hata: Görsel boyutu 1MB\'dan büyük olamaz!');
            return;
        }

        try {
            setIsUploading(true);
            const publicUrl = await adminService.uploadImage(file);
            setEditingAd(prev => ({ ...prev, image_url: publicUrl }));
            setMessage({ type: 'success', text: 'Görsel başarıyla yüklendi.' });
        } catch (error) {
            console.error('Upload Error:', error);
            setUploadError('Görsel yüklenirken hata oluştu.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (editingAd.target_news_id) {
            const val = String(editingAd.target_news_id);
            if (val.includes('http') || val.includes('localhost') || val.includes('/')) {
                alert('❌ "Hedef Haber ID" alanında bir link (URL) var. Lütfen ID numarasını girin veya linki yapıştırdıktan sonra "Çevir" butonuna basarak ID\'ye dönüştürün.');
                return;
            }
        }

        try {
            // URL Validation: Prepend https:// if missing
            let formattedLinkUrl = editingAd.link_url;
            if (formattedLinkUrl && !/^https?:\/\//i.test(formattedLinkUrl)) {
                formattedLinkUrl = 'https://' + formattedLinkUrl;
            }

            const payload = {
                name: editingAd.name || 'Ads',
                placement_code: editingAd.placement_code,
                type: editingAd.type,
                device_type: editingAd.device_type,
                is_active: true,
                width: editingAd.width,
                height: editingAd.height,
                image_url: editingAd.image_url,
                link_url: editingAd.link_url,
                code: editingAd.code,
                target_news_id: editingAd.target_news_id ? parseInt(editingAd.target_news_id) : null,
                target_page: editingAd.target_page,
                target_category: editingAd.target_category,
                start_date: editingAd.start_date || null,
                end_date: editingAd.end_date || null,
                is_sticky: editingAd.is_sticky || false
            };

            if (isCreating) {
                if (payload.placement_code === 'headline_slider') {
                    try {
                        const slot = await adminService.getNextAvailableHeadlineSlot();
                        payload.is_headline = true;
                        payload.headline_slot = slot;
                    } catch (err) {
                        console.error('Error auto-assigning slot:', err);
                    }
                } else if (payload.placement_code === 'manset_2_slider') {
                    try {
                        const slot = await adminService.getNextAvailableManset2Slot();
                        payload.is_manset_2 = true;
                        payload.manset_2_slot = slot;
                    } catch (err) {
                        console.error('Error auto-assigning manset 2 slot:', err);
                    }
                }
                await adminService.createAdPlacement(payload);
                setMessage({ type: 'success', text: 'Yeni reklam alanı oluşturuldu.' });
            } else {
                if (payload.placement_code === 'headline_slider' && !editingAd.headline_slot) {
                    try {
                        const slot = await adminService.getNextAvailableHeadlineSlot();
                        payload.is_headline = true;
                        payload.headline_slot = slot;
                    } catch (err) {
                        console.error('Error auto-assigning slot:', err);
                    }
                } else if (payload.placement_code === 'manset_2_slider' && !editingAd.manset_2_slot) {
                    try {
                        const slot = await adminService.getNextAvailableManset2Slot();
                        payload.is_manset_2 = true;
                        payload.manset_2_slot = slot;
                    } catch (err) {
                        console.error('Error auto-assigning manset 2 slot:', err);
                    }
                }
                await adminService.updateAdPlacement(editingAd.id, payload);
                const tabName = STANDARD_PLACEMENTS[payload.placement_code] ? STANDARD_PLACEMENTS[payload.placement_code].name.split(' ')[0] : 'Özel Alanlar';
                setMessage({ type: 'success', text: `Reklam güncellendi! (${tabName} sekmesine bakınız)` });
            }

            setEditingAd(null);
            setIsCreating(false);
            loadData();
        } catch (error) {
            console.error('Error saving ad:', error);
            setMessage({ type: 'error', text: 'Hata: ' + (error.message || error.details || 'Bilinmeyen hata') });
        }
    };

    const handleRemoveAd = async (e, ad) => {
        e.stopPropagation();

        const confirmMsg = "Bu reklamı TAMAMEN SİLMEK istediğinize emin misiniz? Bu işlem geri alınamaz.";

        if (!window.confirm(confirmMsg)) return;

        try {
            setLoading(true);

            // Hard delete for ALL Placements (Standard or Custom)
            await adminService.deleteAdPlacement(ad.id);
            // Immediately remove from state to prevent ghosting
            setPlacements(prev => prev.filter(p => p.id !== ad.id));
            setMessage({ type: 'success', text: 'Reklam alanı tamamen silindi.' });

            await loadData();
        } catch (error) {
            console.error('Error removing ad:', error);
            setMessage({ type: 'error', text: 'İşlem sırasında hata oluştu: ' + (error.message || 'Bilinmeyen hata') });
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;

        // Dropped outside the list or same place
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const sourcePlacementCode = source.droppableId;
        const targetPlacementCode = destination.droppableId;

        // Find the ad being dragged
        const draggedAd = placements.find(p => p.id === draggableId);
        if (!draggedAd) return;

        // Find ads in the target destination
        // Note: DragDropContext doesn't give us the target list implicitly for checking content, we rely on state.
        const targetAds = placements.filter(p => p.placement_code === targetPlacementCode);

        // Determine if this is a swap (moving to a populated slot)
        const isSwap = targetAds.length > 0 && sourcePlacementCode !== targetPlacementCode;

        const targetLabel = STANDARD_PLACEMENTS[targetPlacementCode]?.name || targetPlacementCode;
        let confirmMessage = `Bu reklamı "${targetLabel}" alanına taşımak istediğinize emin misiniz?`;

        if (isSwap) {
            confirmMessage = `Bu reklamı "${targetLabel}" alanındaki reklam(lar) ile YER DEĞİŞTİRMEK istediğinize emin misiniz?`;
        }

        if (!window.confirm(confirmMessage)) return;

        setLoading(true);

        try {
            // Update Source Ad -> Target
            await adminService.updateAdPlacement(draggedAd.id, {
                ...draggedAd,
                placement_code: targetPlacementCode
            });

            // If Swap: Update target ads -> Source
            if (isSwap) {
                for (const targetAd of targetAds) {
                    await adminService.updateAdPlacement(targetAd.id, {
                        ...targetAd,
                        placement_code: sourcePlacementCode
                    });
                }
                setMessage({ type: 'success', text: 'Reklamlar yer değiştirildi!' });
            } else {
                setMessage({ type: 'success', text: 'Reklam taşındı!' });
            }

            // Reload ads to sync UI
            await loadData();
        } catch (error) {
            console.error('Drag end error:', error);
            setMessage({ type: 'error', text: 'Taşıma işleminde hata oluştu.' });
        } finally {
            setLoading(false);
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
            height: standard ? standard.h : 250,
            image_url: '',
            link_url: '',
            code: '',
            target_news_id: '',
            target_page: 'all',
            target_category: '',
            start_date: '',
            end_date: ''
        });
        setIsCreating(true);
    };

    const startEdit = (ad) => {
        setEditingAd(ad);
        setIsCreating(false);
    };

    const getAdsForSlot = (code) => {
        return placements.filter(p => p.placement_code === code);
    };

    const downloadReport = () => {
        if (!placements || placements.length === 0) {
            alert('İndirilecek veri bulunamadı.');
            return;
        }

        let adsToExport = selectedReportIds.length > 0
            ? placements.filter(p => selectedReportIds.includes(p.id))
            : placements;

        let csvContent = "Reklam Adi,Yerlesim,Genislik,Yukseklik,Cihaz,Goruntuleme,Tiklama,CTR (%),Durum\n";

        adsToExport.forEach(ad => {
            const standard = STANDARD_PLACEMENTS[ad.placement_code];
            const placementName = standard ? standard.name : ad.placement_code;
            const w = standard ? standard.w : ad.width;
            const h = standard ? standard.h : ad.height;

            const views = ad.views || 0;
            const clicks = ad.clicks || 0;
            const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

            // Detailed Status Logic
            const now = new Date();
            const startDate = ad.start_date ? new Date(ad.start_date) : null;
            const endDate = ad.end_date ? new Date(ad.end_date) : null;
            let status = 'Aktif';

            if (!ad.is_active) {
                status = 'Pasif';
            } else if (endDate && now > endDate) {
                status = 'Süresi Doldu';
            } else if (startDate && now < startDate) {
                status = 'Planlandı';
            }

            const safeName = (ad.name || 'İsimsiz').replace(/,/g, ' ');
            const safePlacement = placementName.replace(/,/g, ' ');

            csvContent += `${safeName},${safePlacement},${w},${h},${ad.device_type},${views},${clicks},${ctr},${status}\n`;
        });

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reklam_raporu_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Sorting Helper
    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getSortedPlacements = () => {
        if (!placements) return [];

        return [...placements].sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'name':
                    aValue = a.name || 'İsimsiz';
                    bValue = b.name || 'İsimsiz';
                    break;
                case 'placement':
                    const standardA = STANDARD_PLACEMENTS[a.placement_code];
                    aValue = standardA ? standardA.name : a.placement_code;
                    const standardB = STANDARD_PLACEMENTS[b.placement_code];
                    bValue = standardB ? standardB.name : b.placement_code;
                    break;
                case 'device':
                    aValue = a.device_type;
                    bValue = b.device_type;
                    break;
                case 'views':
                    aValue = a.views || 0;
                    bValue = b.views || 0;
                    break;
                case 'clicks':
                    aValue = a.clicks || 0;
                    bValue = b.clicks || 0;
                    break;
                case 'ctr':
                    const viewsA = a.views || 0;
                    const clicksA = a.clicks || 0;
                    aValue = viewsA > 0 ? (clicksA / viewsA) : 0;

                    const viewsB = b.views || 0;
                    const clicksB = b.clicks || 0;
                    bValue = viewsB > 0 ? (clicksB / viewsB) : 0;
                    break;
                case 'status':
                    aValue = a.is_active ? 1 : 0;
                    bValue = b.is_active ? 1 : 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-gray-400 ml-1 inline-block" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="text-black ml-1 inline-block" />
            : <ArrowDown size={14} className="text-black ml-1 inline-block" />;
    };

    const SortableHeader = ({ label, columnKey, center = false, className = '' }) => (
        <th
            className={`px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors select-none whitespace-nowrap ${center ? 'text-center' : 'text-left'} ${className}`}
            onClick={() => handleSort(columnKey)}
        >
            <div className={`flex items-center ${center ? 'justify-center' : 'justify-start'} gap-1`}>
                {label}
                <SortIcon columnKey={columnKey} />
            </div>
        </th>
    );

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
        const ads = getAdsForSlot(code);
        const standard = STANDARD_PLACEMENTS[code];
        const displayLabel = label || (standard ? standard.name : code);
        const dimensions = standard ? `${standard.w}x${standard.h}` : '';

        return (
            <Droppable droppableId={code}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                            relative transition-all duration-200
                            ${vertical ? 'w-full' : 'w-full'} 
                            ${h}
                            ${ads.length > 0
                                ? 'bg-gray-100 border-2 border-gray-300'
                                : 'bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 cursor-pointer group'}
                            ${snapshot.isDraggingOver ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                            rounded-lg overflow-hidden
                        `}
                        onClick={() => ads.length === 0 && startCreate(code)}
                    >
                        {/* Empty State */}
                        {ads.length === 0 && (
                            <div className="flex flex-col w-full h-full">
                                <div className="bg-gray-200 px-2 py-1 text-[10px] uppercase font-bold text-gray-500 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <PlusCircle size={12} className="text-gray-400" />
                                        <span>{displayLabel} {dimensions && <span className="text-gray-400 font-normal ml-1">({dimensions})</span>}</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-center p-2">
                                    <span className="text-xs text-gray-400">Reklam alanı boş</span>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); startCreate(code); }}
                                        className="w-full py-1.5 bg-blue-600 text-white text-xs rounded shadow hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 font-bold"
                                    >
                                        <Plus size={12} /> Yeni Ekle
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* List State */}
                        {ads.length > 0 && (
                            <div className="flex flex-col w-full h-full">
                                {/* Header */}
                                <div className="bg-gray-200 px-2 py-1 text-[10px] uppercase font-bold text-gray-500 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Move size={12} className="text-gray-400" />
                                        <span>{displayLabel} {dimensions && <span className="text-gray-400 font-normal ml-1">({dimensions})</span>}</span>
                                    </div>
                                    <span className="bg-gray-300 text-gray-600 px-1 rounded">{ads.length}</span>
                                </div>

                                {/* Scrollable List */}
                                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar relative">
                                    {ads.map((ad, index) => {
                                        const isExpired = ad.end_date && new Date() > new Date(ad.end_date);
                                        const isScheduled = ad.start_date && new Date() < new Date(ad.start_date);

                                        let statusClass = '';
                                        if (!ad.is_active) {
                                            statusClass = 'bg-red-50 hover:border-red-400 border-red-200 opacity-75';
                                        } else if (isExpired) {
                                            statusClass = 'bg-red-50 hover:border-red-400 border-red-200 border-l-4 border-l-red-500';
                                        } else if (isScheduled) {
                                            statusClass = 'bg-yellow-50 hover:border-yellow-400 border-yellow-200';
                                        } else {
                                            statusClass = 'bg-white hover:border-blue-400 border-gray-200';
                                        }

                                        return (
                                            <Draggable key={ad.id} draggableId={String(ad.id)} index={index}>
                                                {(providedSnapshot, snapshot) => (
                                                    <div
                                                        ref={providedSnapshot.innerRef}
                                                        {...providedSnapshot.draggableProps}
                                                        {...providedSnapshot.dragHandleProps}
                                                        style={{ ...providedSnapshot.draggableProps.style }}
                                                        onClick={(e) => { e.stopPropagation(); startEdit(ad); }}
                                                        className={`
                                                        flex items-center gap-2 p-1.5 rounded border shadow-sm cursor-grab active:cursor-grabbing transition-colors
                                                        ${statusClass}
                                                        ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 z-50 opacity-90' : ''}
                                                    `}
                                                    >
                                                        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                                                            <GripVertical size={14} />
                                                        </div>
                                                        <div className={`w-2.5 h-2.5 rounded-full ${ad.is_active ? 'bg-green-500' : 'bg-red-500'} flex-shrink-0 shadow-sm`}></div>
                                                        <span className="text-xs font-medium truncate flex-1 text-left">
                                                            {ad.name || 'İsimsiz'}
                                                        </span>
                                                        <div className="text-[9px] text-gray-400 font-mono bg-gray-50 px-1 rounded border mr-1">{ad.type === 'image' ? 'IMG' : 'CODE'}</div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm('Bu reklamı silmek istediğinize emin misiniz?')) {
                                                                    handleRemoveAd(e, ad);
                                                                }
                                                            }}
                                                            className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded transition-colors"
                                                            title="Reklamı Sil"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}

                                    {/* Add New Button (Inside List) */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); startCreate(code); }}
                                        className="w-full py-1.5 mt-2 bg-blue-600 text-white text-xs rounded shadow hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 font-bold"
                                    >
                                        <Plus size={12} /> Yeni Ekle
                                    </button>
                                </div>
                            </div>
                        )}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
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
            <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left w-full md:w-auto">
                    <h1 className="text-3xl font-bold text-gray-900">Reklam Yerleşimi</h1>
                    <p className="text-gray-500 mt-1">Sitenizdeki reklam alanlarını görsel olarak yönetin.</p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                    <button
                        onClick={toggleEmptyAds}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 ${showEmptyAds ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                    >
                        {showEmptyAds ? <Eye size={16} /> : <EyeOff size={16} />}
                        <span className="hidden sm:inline">Boş Alanları</span> {showEmptyAds ? 'Gizle' : 'Göster'}
                    </button>
                    <button
                        onClick={toggleSponsoredLabel}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border flex items-center gap-2 ${showSponsoredLabel ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                    >
                        {showSponsoredLabel ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        <span className="hidden sm:inline">Sponsorlu Etiketi</span> {showSponsoredLabel ? 'Gizle' : 'Göster'}
                    </button>
                    {message.text && (
                        <div className={`px-4 py-2 rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'} animate-in fade-in`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Warning / Info Alert */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r shadow-sm">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-orange-700">
                            <strong>Dikkat:</strong> Reklam engelleyici (AdBlock) kullanıyorsanız, eklediğiniz reklamları bu panelde göremeyebilirsiniz.
                            Lütfen yönetim panelini kullanırken reklam engelleyicini kapattığınızdan emin olun.
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                            * Yeni özellik: Reklamları sürükleyip bırakarak yerlerini değiştirebilirsiniz.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Editor Interface */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
                    <PageTab id="home" label="Ana Sayfa" icon={Home} />
                    <PageTab id="category" label="Kategori Sayfaları" icon={List} />
                    <PageTab id="detail" label="Haber Detay / İçerik" icon={FileText} />

                    <PageTab id="reports" label="Raporlar" icon={BarChart2} />
                </div>

                {/* Canvas Area with DragDropContext */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="bg-gray-50 min-h-[600px] p-2 md:p-8 overflow-y-auto max-h-[calc(100vh-250px)]">
                        <div className="max-w-5xl mx-auto bg-white shadow-sm border border-gray-200 rounded-xl p-4 md:p-8 min-h-[800px]">

                            {/* --- HOME LAYOUT --- */}
                            {activeTab === 'home' && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-start">
                                        <div className="mr-2 mt-0.5 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></svg>
                                        </div>
                                        <span>
                                            <strong>Ölçü Bilgisi:</strong> Fotoğraf ölçüleri tasarıma göre değişkenlik gösterebilir.
                                            Önerilen ölçüyü yüklemeniz tavsiye edilir, alanın genişliğine göre otomatik uyarlanacaktır.
                                        </span>
                                    </div>

                                    <SectionHeader title="Header / Navigasyon" />
                                    <AdSlot code="home_top" h="h-32" />

                                    <SectionHeader title="Manşet 1 (Ana Manşet)" />
                                    <AdSlot code="headline_slider" h="h-64" />

                                    <SectionHeader title="Manşetler Arası Reklam" />
                                    <AdSlot code="home_between_mansets" h="h-28" />

                                    {/* Manşet 2 (Sürmanşet) Section (Full Width) */}
                                    <SectionHeader title="Manşet 2 (Sürmanşet) Bölümü" />
                                    <div className="w-full">
                                        <AdSlot code="manset_2_slider" h="h-[400px]" />
                                    </div>

                                    <AdSlot code="home_list_top" h="h-28" />

                                    {/* Breaking News Section with Sidebar Ads */}
                                    <SectionHeader title="Son Dakika Bölümü" />
                                    <div className="flex gap-6">
                                        <div className="w-2/3">
                                            <ContentBlock h="h-[700px]" label="Son Dakika (8 Haber - 2 Sütun)" />
                                        </div>
                                        <div className="w-1/3 flex flex-col justify-between min-h-[700px]">
                                            {/* Moved Surmanset Sidebar Ads here per user request */}
                                            <AdSlot code="home_surmanset_sidebar_1" h="h-[250px]" />
                                            <AdSlot code="home_surmanset_sidebar_2" h="h-[250px]" />
                                            <AdSlot code="home_surmanset_sidebar_3" h="h-[250px]" />
                                        </div>
                                    </div>

                                    <SectionHeader title="Multimedya Bölümü" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <ContentBlock h="h-64" label="Video Galerisi" />
                                        <ContentBlock h="h-64" label="Foto Galerisi" />
                                    </div>

                                    <AdSlot code="home_horizontal" h="h-28" />

                                    {/* Dynamic Category Sections */}
                                    {activeCategorySlugs.map(slug => {
                                        const category = categories.find(c => c.slug === slug);
                                        const displayName = category ? category.name : slug;
                                        const upperName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

                                        return (
                                            <div key={slug}>
                                                <SectionHeader title={`${upperName} Kategorisi`} />
                                                <div className="flex gap-6">
                                                    <div className="w-2/3">
                                                        <ContentBlock h="h-[700px]" label={`${upperName} Haberleri (8 Haber - 2 Sütun)`} />
                                                    </div>
                                                    <div className="w-1/3 flex flex-col justify-between min-h-[700px]">
                                                        <AdSlot code={`home_${slug}_sidebar_1`} h="h-[250px]" />
                                                        <AdSlot code={`home_${slug}_sidebar_2`} h="h-[250px]" />
                                                        <AdSlot code={`home_${slug}_sidebar_3`} h="h-[250px]" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}


                                </div>
                            )}

                            {/* --- CATEGORY LAYOUT --- */}
                            {activeTab === 'category' && (
                                <div className="space-y-6">
                                    <SectionHeader title="Header / Navigasyon" />

                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* MAIN CONTENT */}
                                        <div className="w-full lg:w-2/3 flex flex-col gap-6">
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
                                        {/* SIDEBAR */}
                                        <div className="w-full lg:w-1/3 flex flex-col gap-6">
                                            {/* Kategori Sidebar 1 */}
                                            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4">
                                                <AdSlot code="category_sidebar_1" h="h-[250px]" w="w-full" label="Reklam Alani 300x250" />
                                            </div>

                                            {/* Kategori Sidebar 2 */}
                                            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4">
                                                <AdSlot code="category_sidebar_2" h="h-[250px]" w="w-full" label="Reklam Alani 300x250" />
                                            </div>

                                            <AdSlot code="category_sidebar_sticky" h="h-[600px]" label="Sticky (Yapışkan)" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- DETAIL LAYOUT --- */}
                            {activeTab === 'detail' && (
                                <div className="space-y-6">
                                    <SectionHeader title="Header / Navigasyon" />

                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* MAIN CONTENT */}
                                        <div className="w-full lg:w-2/3 flex flex-col gap-6">
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
                                        <div className="w-full lg:w-1/3 flex flex-col gap-6">
                                            <div className="p-4 border border-dashed rounded bg-gray-50">
                                                <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Benzer Haberler</div>

                                                {/* Ad Above Grid */}
                                                <AdSlot code="news_sidebar_sticky" h="h-64" label="Benzer Haberler Üstü" />

                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                    <ContentBlock h="h-32" />
                                                </div>

                                                <p className="text-center text-gray-400 mt-4 text-sm">
                                                    * Düzenlemek istediğiniz reklam alanına tıklayınız.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {activeTab === 'reports' && (
                                <div className="space-y-6">
                                    <div className="bg-black text-white p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 mb-4 shadow-lg">
                                        <div>
                                            <p className="text-gray-400 text-xs mt-1">Detaylı performans verileri ve durum analizi.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selectedReportIds.length > 0 && (
                                                <button
                                                    onClick={handleDeleteSelectedReports}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                    Seçilenleri Sil ({selectedReportIds.length})
                                                </button>
                                            )}
                                            <button
                                                onClick={downloadReport}
                                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-colors"
                                            >
                                                <Upload className="rotate-180" size={18} />
                                                {selectedReportIds.length > 0 ? `Seçilenleri İndir (${selectedReportIds.length})` : 'Tüm Raporu İndir'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
                                        <table className="w-full text-sm text-left text-gray-500">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                                                <tr>
                                                    <th className="px-6 py-3 w-4">
                                                        <input
                                                            type="checkbox"
                                                            onChange={toggleSelectAllReports}
                                                            checked={placements.length > 0 && selectedReportIds.length === placements.length}
                                                            className="w-4 h-4 rounded border-gray-300 focus:ring-black"
                                                        />
                                                    </th>
                                                    <SortableHeader label="Reklam" columnKey="name" className="min-w-[200px]" />
                                                    <SortableHeader label="Yerleşim / Boyut" columnKey="placement" className="min-w-[150px]" />
                                                    <SortableHeader label="Cihaz" columnKey="device" />
                                                    <SortableHeader label="Görüntüleme" columnKey="views" center />
                                                    <SortableHeader label="Tıklama" columnKey="clicks" center />
                                                    <SortableHeader label="CTR (%)" columnKey="ctr" center />
                                                    <SortableHeader label="Durum" columnKey="status" center className="min-w-[120px]" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {placements.length > 0 ? getSortedPlacements().map((ad) => {
                                                    const standard = STANDARD_PLACEMENTS[ad.placement_code];
                                                    const placementName = standard ? standard.name : ad.placement_code;
                                                    const dims = standard ? `${standard.w}x${standard.h}` : `${ad.width}x${ad.height}`;

                                                    const views = ad.views || 0;
                                                    const clicks = ad.clicks || 0;

                                                    const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

                                                    // Detailed Status Logic for Table & Row Coloring

                                                    const now = new Date();
                                                    const startDate = ad.start_date ? new Date(ad.start_date) : null;
                                                    const endDate = ad.end_date ? new Date(ad.end_date) : null;

                                                    let statusBadge;
                                                    let rowClass = 'bg-white hover:bg-gray-50';

                                                    if (!ad.is_active) {
                                                        statusBadge = <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded text-xs font-semibold">Pasif</span>;
                                                        rowClass = 'bg-red-50 hover:bg-red-100';
                                                    } else if (endDate && now > endDate) {
                                                        statusBadge = <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded text-xs font-semibold">Süresi Doldu</span>;
                                                        rowClass = 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
                                                    } else if (startDate && now < startDate) {
                                                        statusBadge = <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded text-xs font-semibold">Planlandı</span>;
                                                        rowClass = 'bg-yellow-50 hover:bg-yellow-100';
                                                    } else {
                                                        statusBadge = <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded text-xs font-semibold">Aktif</span>;
                                                        rowClass = 'bg-white hover:bg-gray-50';
                                                    }

                                                    // Selection override
                                                    if (selectedReportIds.includes(ad.id)) {
                                                        rowClass = 'bg-blue-50 hover:bg-blue-100 ring-1 ring-inset ring-blue-200';
                                                    }

                                                    return (
                                                        <tr key={ad.id} className={`border-b transition-colors ${rowClass}`}>
                                                            <td className="px-6 py-4">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedReportIds.includes(ad.id)}
                                                                    onChange={() => toggleReportSelection(ad.id)}
                                                                    className="w-4 h-4 rounded border-gray-300 focus:ring-black"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center gap-2">
                                                                {ad.image_url ? (
                                                                    <img src={ad.image_url} alt="" className="w-10 h-10 object-cover rounded bg-gray-100" />
                                                                ) : (
                                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Kod</div>
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span>{ad.name || 'İsimsiz Reklam'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="font-semibold">{placementName}</span>
                                                                    <span className="text-xs text-gray-400">{dims}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {ad.device_type === 'mobile' ? <Smartphone size={16} /> : (ad.device_type === 'desktop' ? <Monitor size={16} /> : <div className="flex gap-1"><Monitor size={16} /><Smartphone size={16} /></div>)}
                                                            </td>
                                                            <td className="px-6 py-4 text-center font-mono">{views.toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-center font-mono">{clicks.toLocaleString()}</td>
                                                            <td className="px-6 py-4 text-center font-bold text-blue-600">{ctr}%</td>
                                                            <td className="px-6 py-4 text-center">
                                                                {statusBadge}
                                                            </td>
                                                        </tr>
                                                    );
                                                }) : (
                                                    <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-400">Henüz reklam verisi bulunmuyor.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                        </div>
                        <p className="text-center text-gray-400 mt-8 text-sm">
                            * Düzenlemek istediğiniz reklam alanına tıklayınız. Yeşil alanlar aktif reklamları gösterir.
                        </p>
                    </div >
                </DragDropContext >
            </div >

            {/* Edit/Create Modal */}
            {
                editingAd && (
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

                                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex flex-col space-y-3 mb-4">
                                    <div className="flex items-center space-x-3 border-b border-blue-100 pb-2">
                                        <Layout className="text-blue-500" />
                                        <div className="flex-1">
                                            <span className="block text-xs text-blue-400 uppercase font-bold mb-1">Reklamın Yeri / Konumu</span>

                                            {/* SELECTOR for Standard Placements */}
                                            <select
                                                className="w-full px-2 py-1.5 border border-blue-200 rounded text-sm text-blue-900 focus:ring-blue-500 focus:border-blue-500"
                                                value={editingAd.placement_code || ''}
                                                onChange={(e) => setEditingAd({ ...editingAd, placement_code: e.target.value })}
                                                disabled={!isCreating && !!editingAd.id}
                                            >
                                                <option value="" disabled>Lütfen bir alan seçiniz...</option>
                                                <optgroup label="Ana Sayfa">
                                                    {Object.entries(STANDARD_PLACEMENTS).filter(([k]) => k.startsWith('home_') || k.startsWith('headline')).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.name}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Kategoriler">
                                                    {Object.entries(STANDARD_PLACEMENTS).filter(([k]) => k.startsWith('category_')).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.name}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Haber Detay / İçerik">
                                                    {Object.entries(STANDARD_PLACEMENTS).filter(([k]) => k.startsWith('news_')).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.name}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="Yan Menüler (Sidebar)">
                                                    {Object.entries(STANDARD_PLACEMENTS).filter(([k]) => k.includes('sidebar') && !k.startsWith('category') && !k.startsWith('news')).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.name}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>


                                    </div>

                                    <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-xs flex items-start">
                                        <div className="mr-2 mt-0.5 flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="16" y2="12" /><line x1="12" x2="12.01" y1="8" y2="8" /></svg>
                                        </div>
                                        <span>
                                            <strong>Ölçü Bilgisi:</strong> Belirtilen ölçüler (örn: 970x250) önerilen tam kullanım alanıdır.
                                            Daha küçük boyutta görseller de yükleyebilirsiniz; sistem görseli otomatik olarak hizalayacaktır.
                                        </span>
                                    </div>
                                </div>



                                {/* Headline Slider Warning */}
                                {editingAd.placement_code === 'headline_slider' && (
                                    <div className="bg-purple-50 border border-purple-200 p-3 rounded-lg mb-4">
                                        <div className="flex items-start gap-2">
                                            <svg className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm text-purple-700">
                                                <strong>🎯 Manşet Slider Reklamı:</strong> Bu reklam otomatik olarak <strong>Manşet Yönetimi</strong> sayfasında görünecek ve sürükleyerek sıralanabilir olacaktır.
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {editingAd.placement_code === 'manset_2_slider' && (
                                    <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg mb-4">
                                        <div className="flex items-start gap-2">
                                            <svg className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <p className="text-sm text-indigo-700">
                                                <strong>🎯 Manşet 2 (Sürmanşet) Reklamı:</strong> Bu reklam otomatik olarak <strong>Manşet Yönetimi (Manşet 2)</strong> sekmesinde görünecek ve yönetilebilir olacaktır.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Reklam Adı (Tanımlayıcı)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                        placeholder="Örn: Nike Kış Kampanyası"
                                        value={editingAd.name || ''}
                                        onChange={(e) => setEditingAd({ ...editingAd, name: e.target.value })}
                                    />
                                </div>

                                {editingAd.placement_code?.startsWith('news_') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Haber ID</label>
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm pl-10 pr-24"
                                                placeholder="Haber ID veya Haber Sayfası Linkini Yapıştırın..."
                                                value={editingAd.target_news_id || ''}
                                                onChange={async (e) => {
                                                    const val = e.target.value;
                                                    setEditingAd({ ...editingAd, target_news_id: val });

                                                    // Auto-detect attempt (silent)
                                                    if (val.includes('http') || val.includes('www') || val.includes('/')) {
                                                        const parts = val.split('/').filter(p => p.trim() !== '' && !p.includes('http'));
                                                        const possibleSlug = parts[parts.length - 1];
                                                        if (possibleSlug && possibleSlug.length > 2) {
                                                            try {
                                                                const news = await adminService.getNewsBySlug(possibleSlug);
                                                                if (news && news.id) {
                                                                    setEditingAd(prev => ({ ...prev, target_news_id: news.id }));
                                                                    // Optional toast or just let it swap
                                                                }
                                                            } catch (err) { }
                                                        }
                                                    }
                                                }}
                                            />
                                            <div className="absolute left-3 text-gray-400">
                                                <FileText size={16} />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    const val = String(editingAd.target_news_id || '');
                                                    if (!val || val.trim() === '') return;

                                                    // Handle URL to ID conversion
                                                    if (val.includes('http') || val.includes('www') || val.includes('/')) {
                                                        const parts = val.split('/').filter(p => p.trim() !== '' && !p.includes('http'));
                                                        const possibleSlug = parts[parts.length - 1];

                                                        try {
                                                            const news = await adminService.getNewsBySlug(possibleSlug);
                                                            if (news && news.id) {
                                                                setEditingAd(prev => ({ ...prev, target_news_id: news.id }));
                                                                alert(`✅ BAŞARILI: Haber bulundu!\n\n"${news.title}"\n\nID: ${news.id}`);
                                                            } else {
                                                                alert('❌ Haber bulunamadı. Linkin doğru olduğundan emin olun.');
                                                            }
                                                        } catch (err) {
                                                            alert('❌ Hata: Haber verisi çekilemedi.');
                                                        }
                                                    } else {
                                                        alert('⚠️ Bu zaten bir ID gibi görünüyor veya geçerli bir link değil.');
                                                    }
                                                }}
                                                className="absolute right-1 top-1 bottom-1 bg-black text-white text-xs px-3 rounded hover:bg-gray-800 transition-colors"
                                            >
                                                ID Bul
                                            </button>
                                        </div>
                                        <div className="mt-1 ml-1 space-y-1">
                                            <p className="text-[10px] text-gray-500">* Haberin linkini yapıştırırsanız otomatik olarak ID'ye çevrilecektir.</p>
                                            <p className="text-[10px] text-red-500 font-semibold">* DİKKAT: Eğer bu alan boş bırakılırsa, reklam seçilen alanda TÜM haber detaylarında görünür.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Ad Type Toggle */}
                                <div className="flex p-1 bg-gray-100 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setEditingAd({ ...editingAd, type: 'code' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${editingAd.type === 'code' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Kod (HTML/JS)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingAd({ ...editingAd, type: 'adsense' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${editingAd.type === 'adsense' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Google AdSense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingAd({ ...editingAd, type: 'image' })}
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${editingAd.type === 'image' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Görsel (JPG/PNG)
                                    </button>
                                </div>

                                {/* Form Fields based on Type */}
                                <div className="space-y-4">
                                    {editingAd.type === 'image' ? (
                                        <>
                                            {/* Image Upload Area */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Reklam Görseli</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                    <input
                                                        type="file"
                                                        onChange={handleFileUpload}
                                                        accept="image/*"
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />
                                                    {isUploading ? (
                                                        <Loader className="animate-spin text-gray-400" size={32} />
                                                    ) : editingAd.image_url ? (
                                                        <img src={editingAd.image_url} alt="Preview" className="max-h-40 object-contain rounded" />
                                                    ) : (
                                                        <>
                                                            <Upload className="text-gray-400 mb-2" size={32} />
                                                            <span className="text-sm text-gray-500">Görsel yüklemek için tıklayın</span>
                                                            <span className="text-xs text-gray-400 mt-1">veya sürükleyip bırakın</span>
                                                        </>
                                                    )}
                                                </div>
                                                {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Yönlendirilecek Link (Opsiyonel)</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm"
                                                    placeholder="https://..."
                                                    value={editingAd.link_url || ''}
                                                    onChange={(e) => setEditingAd({ ...editingAd, link_url: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">HTML / JS Kodu</label>
                                            <textarea
                                                required
                                                rows={8}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black text-sm font-mono"
                                                placeholder="<script>...</script> veya <iframe>...</iframe>"
                                                value={editingAd.code || ''}
                                                onChange={(e) => setEditingAd({ ...editingAd, code: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* TARGETING OPTIONS */}
                                <div className="border-t border-gray-100 pt-4">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Hedefleme ve Zamanlama</h4>

                                    {/* Sticky Toggle */}


                                    {/* Date Scheduling */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Başlangıç Tarihi</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-black focus:border-black"
                                                value={(() => {
                                                    if (!editingAd.start_date) return '';
                                                    const date = new Date(editingAd.start_date);
                                                    const offsetMs = date.getTimezoneOffset() * 60000;
                                                    const localDate = new Date(date.getTime() - offsetMs);
                                                    return localDate.toISOString().slice(0, 16);
                                                })()}
                                                onChange={(e) => setEditingAd({ ...editingAd, start_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Boş bırakılırsa hemen yayınlanır.</p>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Bitiş Tarihi</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-black focus:border-black"
                                                value={(() => {
                                                    if (!editingAd.end_date) return '';
                                                    const date = new Date(editingAd.end_date);
                                                    const offsetMs = date.getTimezoneOffset() * 60000;
                                                    const localDate = new Date(date.getTime() - offsetMs);
                                                    return localDate.toISOString().slice(0, 16);
                                                })()}
                                                onChange={(e) => setEditingAd({ ...editingAd, end_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                            />
                                            <p className="text-[10px] text-gray-400 mt-1">Süre dolunca reklam otomatik gizlenir (silinmez).</p>
                                        </div>
                                    </div>

                                    {/* Device Type */}
                                    <div className="mb-4">
                                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase">Cihaz Hedefleme</label>
                                        <select
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:ring-black focus:border-black"
                                            value={editingAd.device_type}
                                            onChange={(e) => setEditingAd({ ...editingAd, device_type: e.target.value })}
                                        >
                                            <option value="all">Tüm Cihazlar (Varsayılan)</option>
                                            <option value="desktop">Sadece Masaüstü</option>
                                            <option value="mobile">Sadece Mobil</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    {!isCreating && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                if (window.confirm("Bu reklamı tamamen kaldırmak istediğinize emin misiniz?")) {
                                                    handleRemoveAd(e, editingAd);
                                                    setEditingAd(null);
                                                }
                                            }}
                                            className="px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={18} />
                                            <span>Kaldır</span>
                                        </button>
                                    )}
                                    <button type="button" onClick={() => setEditingAd(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Vazgeç</button>
                                    <button type="submit" className="flex-1 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div >
                )
            }
        </div >
    );
};

export default AdsPage;
