import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchVideos, fetchVideoDetail, fetchPhotoGalleries, fetchGalleryImages, incrementVideoView, incrementPhotoGalleryView } from '../services/api';
import { mapVideoItem, mapPhotoGalleryItem } from '../utils/mappers';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';
import VideoArticle from '../components/VideoArticle';
import PhotoArticle from '../components/PhotoArticle';
import AdBanner from '../components/AdBanner';
import { Camera, Eye, Play } from 'lucide-react';

const VideoDetailPage = () => {
    const { slug, id } = useParams();

    const [displayedItems, setDisplayedItems] = useState([]);
    const [allGalleryItems, setAllGalleryItems] = useState([]);
    const [relatedItems, setRelatedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Store images keyed by album ID
    const [albumImagesCache, setAlbumImagesCache] = useState({});

    const observerTarget = useRef(null);
    const viewedIds = useRef(new Set());

    // Refs for stable callbacks
    const displayedItemsRef = useRef(displayedItems);
    const allGalleryItemsRef = useRef(allGalleryItems);
    const isLoadingMoreRef = useRef(isLoadingMore);

    useEffect(() => {
        displayedItemsRef.current = displayedItems;
        allGalleryItemsRef.current = allGalleryItems;
        isLoadingMoreRef.current = isLoadingMore;
    }, [displayedItems, allGalleryItems, isLoadingMore]);

    // Helper to fetch images if missing
    const getOrFetchImages = async (albumItem) => {
        if (albumImagesCache[albumItem.id]) return albumImagesCache[albumItem.id];
        try {
            const images = await fetchGalleryImages(albumItem.id);
            setAlbumImagesCache(prev => ({ ...prev, [albumItem.id]: images }));
            return images;
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    // Initial load
    useEffect(() => {
        if (displayedItems.length > 0 && String(displayedItems[0].id) === String(id)) {
            return;
        }

        setDisplayedItems([]);
        setIsLoadingMore(false);

        const loadContent = async () => {
            setLoading(true);
            try {
                let initialItem = null;

                if (id) {
                    const detail = await fetchVideoDetail(id);
                    if (detail) initialItem = { ...mapVideoItem(detail), type: 'video' };
                }

                const [photoRes, videoRes] = await Promise.all([
                    fetchPhotoGalleries(1, 40),
                    fetchVideos(1, 40)
                ]);

                const photoList = (photoRes.data || [])
                    .map(item => ({ ...mapPhotoGalleryItem(item), type: 'photo' }));
                
                const videoList = (videoRes.data || [])
                    .map(item => ({ ...mapVideoItem(item), type: 'video' }));

                const mappedList = [...photoList, ...videoList].sort((a, b) => {
                    const dateA = new Date(a.created_at || a.date);
                    const dateB = new Date(b.created_at || b.date);
                    return dateB - dateA;
                });

                setAllGalleryItems(mappedList);

                if (!initialItem) {
                    initialItem = mappedList.find(item => slugify(item.title) === slug);
                }

                if (initialItem) {
                    setDisplayedItems([initialItem]);
                    setRelatedItems(mappedList
                        .filter(item => item.id !== initialItem.id)
                        .slice(0, 10));
                }
            } catch (err) {
                console.error("Error loading gallery details:", err);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [slug, id]);

    // Scroll to top
    useEffect(() => {
        if (displayedItems.length === 1) {
            window.scrollTo(0, 0);
        }
    }, [displayedItems.length]);

    // Load next logic
    const loadNextItem = useCallback(async () => {
        if (isLoadingMoreRef.current || displayedItemsRef.current.length === 0 || allGalleryItemsRef.current.length === 0) {
            return;
        }

        const lastItem = displayedItemsRef.current[displayedItemsRef.current.length - 1];
        const currentIndex = allGalleryItemsRef.current.findIndex(item => item.id === lastItem.id && item.type === lastItem.type);

        let nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % allGalleryItemsRef.current.length;
        const nextItem = allGalleryItemsRef.current[nextIndex];

        if (!displayedItemsRef.current.find(d => d.id === nextItem.id && d.type === nextItem.type)) {
            setIsLoadingMore(true);
            if (nextItem.type === 'photo') await getOrFetchImages(nextItem);
            setDisplayedItems(prev => [...prev, nextItem]);
            setTimeout(() => setIsLoadingMore(false), 100);
        }
    }, []);

    // Intersection Observer
    useEffect(() => {
        if (loading || displayedItems.length === 0) return;
        let observer = new IntersectionObserver(
            (entries) => { if (entries[0].isIntersecting) loadNextItem(); },
            { threshold: 0.1, rootMargin: '400px' }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [loadNextItem, loading, displayedItems.length]);

    // Visibility Handler
    const handleItemVisible = useCallback((item) => {
        const itemSlug = slugify(item.title);
        const newUrl = item.type === 'video' ? `/video-galeri/${itemSlug}` : `/foto-galeri/${itemSlug}`;

        if (window.location.pathname !== newUrl) {
            window.history.replaceState(null, '', newUrl);
            document.title = `${item.title} | Haberfoni`;
        }

        if (!viewedIds.current.has(`${item.type}-${item.id}`)) {
            if (item.type === 'video') incrementVideoView(item.id).catch(console.error);
            else incrementPhotoGalleryView(item.id).catch(console.error);
            
            viewedIds.current.add(`${item.type}-${item.id}`);
            setDisplayedItems(prev => prev.map(i =>
                (i.id === item.id && i.type === item.type) ? { ...i, views: (i.views || 0) + 1 } : i
            ));
        }
    }, []);

    if (loading) return <div className="text-center py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    if (displayedItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">İçerik Bulunamadı</h1>
                <Link to="/foto-galeri" className="text-primary hover:underline">Galeriye Dön</Link>
            </div>
        );
    }

    const currentItem = displayedItems[0];

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title={currentItem.seo_title || currentItem.title}
                description={currentItem.seo_description || `${currentItem.title} ${currentItem.type === 'video' ? 'videosu' : 'fotoğraf galerisi'}.`}
                url={currentItem.type === 'video' ? `/video-galeri/${slug}` : `/foto-galeri/${slug}`}
                image={currentItem.thumbnail}
                type="article"
                publishedTime={currentItem.published_at}
                modifiedTime={currentItem.created_at}
                tags={currentItem.seo_keywords ? currentItem.seo_keywords.split(',') : ['Video', 'Haber', 'Galeri']}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary">Ana Sayfa</Link>
                    <span>/</span>
                    <Link to="/foto-galeri" className="hover:text-primary">Galeri</Link>
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-md">{currentItem.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {displayedItems.map((item, index) => (
                            item.type === 'video' ? (
                                <VideoArticle
                                    key={`video-${item.id}-${index}`}
                                    video={item}
                                    relatedVideos={[]}
                                    onVisible={handleItemVisible}
                                />
                            ) : (
                                <PhotoArticle
                                    key={`photo-${item.id}-${index}`}
                                    album={item}
                                    images={albumImagesCache[item.id] || []}
                                    relatedAlbums={[]}
                                    onVisible={handleItemVisible}
                                />
                            )
                        ))}

                        {/* Observer Sentinel */}
                        <div ref={observerTarget} className="h-20 flex items-center justify-center p-4">
                            {displayedItems.length < allGalleryItems.length ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            ) : (
                                <span className="text-gray-400 text-sm">Tüm içerikler görüntülendi.</span>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Sticky Related Videos and Ads */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-[180px] max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2">
                            <div className="mb-6">
                                <AdBanner
                                    placementCode="news_sidebar_sticky" // Reusing sidebar ad placement
                                    vertical={true}
                                    customDimensions="300x600"
                                />
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-primary pb-2 uppercase">
                                    Önerilen Galeriler
                                </h3>
                                <div className="space-y-4">
                                    {relatedItems.map((item) => (
                                        <Link
                                            key={`${item.type}-${item.id}`}
                                            to={item.type === 'video' ? `/video-galeri/${slugify(item.title)}` : `/foto-galeri/${slugify(item.title)}`}
                                            className="flex space-x-3 group"
                                        >
                                            <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded">
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute bottom-0 right-0 bg-primary text-white text-[10px] px-1 font-bold flex items-center gap-1">
                                                    {item.type === 'video' ? <Play size={10} fill="currentColor" /> : (item.count || <Camera size={10} />)}
                                                </div>
                                                {item.type === 'video' && (
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Play size={16} className="text-white" fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <span>{item.date}</span>
                                                    <span>•</span>
                                                    <div className="flex items-center space-x-1">
                                                        <Eye size={12} />
                                                        <span>{item.views}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailPage;
