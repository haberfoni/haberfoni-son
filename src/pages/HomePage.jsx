import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Surmanset from '../components/Surmanset';
import AdBanner from '../components/AdBanner';
import SEO from '../components/SEO';
import MultimediaRow from '../components/MultimediaRow';
import ImageWithFallback from '../components/ImageWithFallback';
import { TrendingUp, ArrowRight, Clock, Globe, Trophy, Cpu, HeartPulse, Palette, Landmark, Coffee, GraduationCap, Sparkles, Car, Banknote, Newspaper, Layout } from 'lucide-react';
import { fetchNews, fetchHeadlines, fetchSurmanset, fetchHomeVideos, fetchHomePhotoGalleries, fetchCategories } from '../services/api';
import { mapNewsItem } from '../utils/mappers';
import { slugify } from '../utils/slugify';
import { toTurkishTitleCase } from '../utils/turkishCase';

// Helper to get icon for category (case-insensitive)
const getCategoryIcon = (categoryName) => {
    if (!categoryName) return Layout;

    const normalized = categoryName.toString().trim().toLowerCase();

    // Explicit override for Dünya and Gündem to handle edge cases and typos
    if (normalized.includes('dunya') || normalized.includes('dünya')) return Globe;
    if (normalized.includes('gundem') || normalized.includes('gündem')) return Newspaper;

    // Map of normalized keys to icons
    const iconMap = {
        'ekonomi': Banknote,
        'spor': Trophy,
        'teknoloji': Cpu,
        'saglik': HeartPulse,
        'sağlık': HeartPulse,
        'kultur': Palette,
        'kültür': Palette,
        'politika': Landmark,
        'yasam': Coffee,
        'yaşam': Coffee,
        'egitim': GraduationCap,
        'eğitim': GraduationCap,
        'magazin': Sparkles,
        'otomobil': Car
    };

    return iconMap[normalized] || Layout;
};

const HomePage = () => {
    const [heroItems, setHeroItems] = React.useState([]);
    const [gridItems, setGridItems] = React.useState([]);
    const [surmansetItems, setSurmansetItems] = React.useState([]);
    const [videos, setVideos] = React.useState([]);
    const [photos, setPhotos] = React.useState([]);
    const [categoryNews, setCategoryNews] = React.useState({});
    const [layoutConfig, setLayoutConfig] = React.useState(null);
    const [categoryMap, setCategoryMap] = React.useState({});

    React.useEffect(() => {
        const loadLayout = async () => {
            try {
                const { adminService } = await import('../services/adminService');
                const layout = await adminService.getHomeLayout();
                setLayoutConfig(layout);
            } catch (error) {
                console.error('Error loading layout:', error);
                // Fallback default layout
                setLayoutConfig({
                    sections: [
                        { id: 'home_top', enabled: true },
                        { id: 'headline_slider', enabled: true },
                        { id: 'home_between_mansets', enabled: true },
                        { id: 'surmanset', enabled: true },
                        { id: 'breaking_news', enabled: true },
                        { id: 'multimedia', enabled: true },
                        { id: 'categories', enabled: true }
                    ],
                    // categoryConfig will optionally come from layout or be undefined (handled in render)
                });
            }
        };
        loadLayout();
    }, []);

    React.useEffect(() => {
        const loadNews = async () => {
            try {
                // 1. Try to load simplified initial data from standard localStorage check
                // This is critical for LCP (Largest Contentful Paint) optimization
                const cachedHeadlines = localStorage.getItem('headlines_cache');
                if (cachedHeadlines) {
                    try {
                        const parsed = JSON.parse(cachedHeadlines);
                        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                            setHeroItems(parsed.map(mapNewsItem));
                        }
                    } catch (e) {
                        console.warn('Cache parse error', e);
                    }
                }

                // Execute fetches in parallel
                const [headlinesData, surmansetData, allNews, videoData, photoData, categoriesData] = await Promise.all([
                    fetchHeadlines().catch(e => { console.error(e); return []; }),
                    fetchSurmanset().catch(e => { console.error(e); return []; }),
                    fetchNews().catch(e => { console.error(e); return []; }),
                    fetchHomeVideos().catch(e => { console.error(e); return []; }),
                    fetchHomePhotoGalleries().catch(e => { console.error(e); return []; }),
                    fetchCategories().catch(e => { console.error(e); return []; })
                ]);

                // Create Slug -> Name map
                const map = {};
                categoriesData.forEach(cat => {
                    // Normalize slug just in case
                    if (cat.slug) map[cat.slug] = cat.name;
                    // Also map normalized name as fallback
                    if (cat.name) map[slugify(cat.name)] = cat.name;
                });
                setCategoryMap(map);

                // Update state and cache with fresh data
                if (headlinesData && headlinesData.length > 0) {
                    localStorage.setItem('headlines_cache', JSON.stringify(headlinesData));
                    setHeroItems(headlinesData.map(mapNewsItem));
                }
                setSurmansetItems(surmansetData.map(mapNewsItem));
                setGridItems(allNews.map(mapNewsItem));
                setVideos(videoData);
                setPhotos(photoData);

                // Group news by category using properly mapped names
                const grouped = {};
                allNews.forEach(news => {
                    const rawExample = news.category || 'Genel';
                    // Try to find exact match in map, or slugified match, or just use raw with Turkish Case
                    const categoryName = map[rawExample] || map[slugify(rawExample)] || toTurkishTitleCase(rawExample);

                    if (!grouped[categoryName]) {
                        grouped[categoryName] = [];
                    }
                    grouped[categoryName].push(mapNewsItem(news));
                });
                setCategoryNews(grouped);
            } catch (error) {
                console.error('Error loading homepage news:', error);
            }
        };
        loadNews();
    }, []);

    const isSectionEnabled = (sectionId) => {
        if (!layoutConfig) return true;
        const section = layoutConfig.sections.find(s => s.id === sectionId);
        return section ? section.enabled : true;
    };

    const getOrderedSections = () => {
        if (!layoutConfig || !layoutConfig.sections) {
            return ['home_top', 'headline_slider', 'home_between_mansets', 'surmanset', 'breaking_news', 'multimedia', 'categories'];
        }
        return layoutConfig.sections.map(s => s.id);
    };

    const renderSection = (sectionId) => {
        if (!isSectionEnabled(sectionId)) return null;

        switch (sectionId) {
            case 'home_top':
                return (
                    <div className="container mx-auto px-4 pt-4">
                        <AdBanner placementCode="home_top" customMobileDimensions="320x100" customHeight="h-[100px] md:h-[250px]" />
                    </div>
                );

            case 'headline_slider':
                return <Hero items={heroItems} />;

            case 'home_between_mansets':
                return (
                    <div className="container mx-auto px-4 mt-8">
                        <AdBanner placementCode="home_between_mansets" customDimensions="970x250" customMobileDimensions="300x250" customHeight="h-[250px]" />
                    </div>
                );

            case 'surmanset':
                return surmansetItems.length > 0 ? (
                    <div className="container mx-auto px-4 mt-8">
                        {/* Made full width per user request to move ads to Son Dakika sidebar */}
                        <div className="w-full">
                            <Surmanset items={surmansetItems} />
                        </div>
                    </div>
                ) : null;

            case 'breaking_news':
                return (
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="w-full lg:w-2/3">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[700px]">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-red-600">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-red-600 text-white p-2 rounded-lg">
                                                <TrendingUp size={24} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900">Son Dakika</h2>
                                        </div>
                                        <Link to="/tum-haberler" className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
                                            Tümünü Gör
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {gridItems.slice(0, 8).map((news) => (
                                            <Link
                                                key={news.id}
                                                to={`/${news.category || 'haber'}/${slugify(news.title)}/${news.id}`}
                                                className="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                            >
                                                <div className="relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                    <ImageWithFallback
                                                        src={news.image || news.image_url}
                                                        alt={news.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        width="160"
                                                        height="128"
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                                    <h3 className="text-base font-bold text-gray-900 line-clamp-3 group-hover:text-red-600 transition-colors leading-snug">
                                                        {news.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                                        <Clock size={12} />
                                                        <span>{news.time || 'Az önce'}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full lg:w-1/3 flex flex-col gap-4 min-h-[700px]">
                                {/* Moved Surmanset Sidebar Ads here per user request */}
                                <AdBanner placementCode="home_surmanset_sidebar_1" customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                                <AdBanner placementCode="home_surmanset_sidebar_2" customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                                <AdBanner placementCode="home_surmanset_sidebar_3" customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                            </div>
                        </div>
                    </div>
                );

            case 'multimedia':
                return (
                    <>
                        <MultimediaRow videos={videos} photos={photos} />
                        <div className="container mx-auto px-4 mt-8">
                            <AdBanner placementCode="home_horizontal" customDimensions="970x250" customMobileDimensions="300x250" customHeight="h-[250px]" />
                        </div>
                    </>
                );

            case 'categories':
                // Dynamic rendering based on config if available
                if (layoutConfig?.categoryConfig?.length > 0) {
                    return layoutConfig.categoryConfig
                        .filter(config => config.enabled)
                        .map(config => {
                            // Find the mapped name for this slug
                            const mappedName = categoryMap[config.id] || toTurkishTitleCase(config.id);

                            // Try to find news with mappedName (usually Title Case e.g. "Gündem")
                            // Or fallback to slug if grouped differently
                            const news = categoryNews[mappedName] || categoryNews[config.id] || [];

                            if (news.length < 4) return null; // Minimum 4 requirement

                            // Determine colors and slug
                            const categoryColors = {
                                'Gündem': 'blue',
                                'Ekonomi': 'green',
                                'Spor': 'orange',
                                'Teknoloji': 'purple',
                                'Sağlık': 'red',
                                'Kültür': 'pink',
                                'Dünya': 'indigo',
                                'Politika': 'gray',
                                'Yaşam': 'teal',
                                'Eğitim': 'yellow',
                                'Magazin': 'fuchsia',
                                'Otomobil': 'red'
                            };
                            const color = categoryColors[mappedName] || 'blue';
                            const categorySlug = config.id; // Use slug from config

                            const displayTitle = config.title || mappedName; // Use custom title from config if set

                            const IconComponent = getCategoryIcon(mappedName);

                            return (
                                <div key={config.id} className="container mx-auto px-4 mb-12">
                                    <div className="flex flex-col lg:flex-row gap-6 mt-8">
                                        <div className="w-full lg:w-2/3">
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[700px]">
                                                <div className={`flex items-center justify-between mb-6 pb-4 border-b-2 border-${color}-600`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`bg-${color}-600 text-white p-2 rounded-lg`}>
                                                            <IconComponent size={24} />
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-gray-900">{displayTitle}</h2>
                                                    </div>
                                                    <Link to={`/kategori/${categorySlug}`} className={`flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-${color}-600 transition-colors`}>
                                                        Tümünü Gör
                                                        <ArrowRight size={14} />
                                                    </Link>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {news.slice(0, 8).map((newsItem) => (
                                                        <Link
                                                            key={newsItem.id}
                                                            to={`/${newsItem.category || 'haber'}/${slugify(newsItem.title)}/${newsItem.id}`}
                                                            className="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                                        >
                                                            <div className="relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                                <ImageWithFallback
                                                                    src={newsItem.image || newsItem.image_url}
                                                                    alt={newsItem.title}
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                    width="160"
                                                                    height="128"
                                                                />
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                                                <h3 className={`text-base font-bold text-gray-900 line-clamp-3 group-hover:text-${color}-600 transition-colors leading-snug`}>
                                                                    {newsItem.title}
                                                                </h3>
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                                                    <Clock size={12} />
                                                                    <span>{newsItem.time || 'Az önce'}</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full lg:w-1/3 flex flex-col justify-between items-end min-h-[700px]">
                                            <div className="w-full">
                                                <AdBanner placementCode={`home_${categorySlug}_sidebar_1`} customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                                            </div>
                                            <div className="w-full">
                                                <AdBanner placementCode={`home_${categorySlug}_sidebar_2`} customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                                            </div>
                                            <div className="w-full">
                                                <AdBanner placementCode={`home_${categorySlug}_sidebar_3`} customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                } else {
                    // Fallback to old dynamic behavior if no config
                    return Object.entries(categoryNews)
                        .filter(([_, news]) => news.length >= 4)
                        .slice(0, 5)
                        .map(([category, news]) => {
                            const categoryColors = {
                                'Gündem': 'blue',
                                'Ekonomi': 'green',
                                'Spor': 'orange',
                                'Teknoloji': 'purple',
                                'Sağlık': 'red',
                                'Kültür': 'pink',
                                'Dünya': 'indigo',
                                'Politika': 'gray',
                                'Yaşam': 'teal',
                                'Eğitim': 'yellow',
                                'Magazin': 'fuchsia',
                                'Otomobil': 'red'
                            };
                            const color = categoryColors[category] || 'blue';
                            const categorySlug = slugify(category);

                            const IconComponent = getCategoryIcon(category);

                            return (
                                <div key={category} className="container mx-auto px-4 mb-12">
                                    <div className="flex flex-col lg:flex-row gap-6 mt-8">
                                        <div className="w-full lg:w-2/3">
                                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[700px]">
                                                <div className={`flex items-center justify-between mb-6 pb-4 border-b-2 border-${color}-600`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`bg-${color}-600 text-white p-2 rounded-lg`}>
                                                            <IconComponent size={24} />
                                                        </div>
                                                        <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                                                    </div>
                                                    <Link to={`/kategori/${categorySlug}`} className={`flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-${color}-600 transition-colors`}>
                                                        Tümünü Gör
                                                        <ArrowRight size={14} />
                                                    </Link>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {news.slice(0, 8).map((newsItem) => (
                                                        <Link
                                                            key={newsItem.id}
                                                            to={`/${newsItem.category || 'haber'}/${slugify(newsItem.title)}/${newsItem.id}`}
                                                            className="group flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                                                        >
                                                            <div className="relative w-40 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                                <ImageWithFallback
                                                                    src={newsItem.image || newsItem.image_url}
                                                                    alt={newsItem.title}
                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                    width="160"
                                                                    height="128"
                                                                />
                                                            </div>
                                                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                                                <h3 className={`text-base font-bold text-gray-900 line-clamp-3 group-hover:text-${color}-600 transition-colors leading-snug`}>
                                                                    {newsItem.title}
                                                                </h3>
                                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                                                    <Clock size={12} />
                                                                    <span>{newsItem.time || 'Az önce'}</span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full lg:w-1/3 flex flex-col justify-between items-end min-h-[700px]">
                                            <div className="w-full">
                                                <AdBanner placementCode={`home_${categorySlug}_sidebar_1`} customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                                            </div>
                                            <div className="w-full">
                                                <AdBanner placementCode={`home_${categorySlug}_sidebar_2`} customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                                            </div>
                                            <div className="w-full">
                                                <AdBanner placementCode={`home_${categorySlug}_sidebar_3`} customDimensions="300x250" customMobileDimensions="300x250" customHeight="h-[250px]" noContainer={true} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        });
                }
            default:
                return null;
        }
    };

    return (
        <>
            <SEO />
            <div className="bg-gray-100 min-h-screen">
                {getOrderedSections().map(sectionId => (
                    <React.Fragment key={sectionId}>
                        {renderSection(sectionId)}
                    </React.Fragment>
                ))}
            </div>
        </>
    );
};

export default HomePage;
