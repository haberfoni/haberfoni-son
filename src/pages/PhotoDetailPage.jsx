import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPhotoGalleries, fetchVideos, fetchPhotoGalleryDetail, fetchGalleryImages, incrementPhotoGalleryView, incrementVideoView } from '../services/api';
import { mapPhotoGalleryItem, mapVideoItem } from '../utils/mappers';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';
import PhotoArticle from '../components/PhotoArticle';
import VideoArticle from '../components/VideoArticle';
import AdBanner from '../components/AdBanner';
import { Camera, Eye, Play } from 'lucide-react';

const PhotoDetailPage = () => {
    const { slug, id } = useParams();

    const [displayedAlbums, setDisplayedAlbums] = useState([]);
    const [allAlbums, setAllAlbums] = useState([]);
    const [relatedAlbums, setRelatedAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Store images keyed by album ID to grab them if they weren't fully attached
    const [albumImagesCache, setAlbumImagesCache] = useState({});

    const observerTarget = useRef(null);
    const viewedIds = useRef(new Set());

    // Refs for stable callbacks
    const displayedAlbumsRef = useRef(displayedAlbums);
    const allAlbumsRef = useRef(allAlbums);
    const isLoadingMoreRef = useRef(isLoadingMore);

    useEffect(() => {
        displayedAlbumsRef.current = displayedAlbums;
        allAlbumsRef.current = allAlbums;
        isLoadingMoreRef.current = isLoadingMore;
    }, [displayedAlbums, allAlbums, isLoadingMore]);

    // Helper to fetch images if missing
    const getOrFetchImages = async (albumItem) => {
        if (albumImagesCache[albumItem.id]) {
            return albumImagesCache[albumItem.id];
        }
        if (albumItem.gallery_images && albumItem.gallery_images.length > 0) {
            setAlbumImagesCache(prev => ({ ...prev, [albumItem.id]: albumItem.gallery_images }));
            return albumItem.gallery_images;
        }
        try {
            const images = await fetchGalleryImages(albumItem.id);
            setAlbumImagesCache(prev => ({ ...prev, [albumItem.id]: images }));
            return images;
        } catch (error) {
            console.error("Error fetching images for album:", albumItem.id, error);
            return [];
        }
    };

    // Initial load
    useEffect(() => {
        if (displayedAlbums.length > 0 && String(displayedAlbums[0].id) === String(id)) {
            return;
        }

        setDisplayedAlbums([]);
        setIsLoadingMore(false);

        const loadContent = async () => {
            setLoading(true);
            try {
                let initialAlbum = null;

                if (id) {
                    const detail = await fetchPhotoGalleryDetail(id);
                    if (detail) {
                        initialAlbum = { ...mapPhotoGalleryItem(detail), type: 'photo' };
                        // Prime the cache if images came with detail
                        if (detail.gallery_images) {
                            setAlbumImagesCache(prev => ({ ...prev, [initialAlbum.id]: detail.gallery_images }));
                        }
                    }
                }

                const [photoRes, videoRes] = await Promise.all([
                    fetchPhotoGalleries(1, 40), // Fetch a larger pool for infinite scroll next items
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

                setAllAlbums(mappedList);

                if (!initialAlbum) {
                    initialAlbum = mappedList.find(item => slugify(item.title) === slug);
                }

                if (initialAlbum) {
                    // pre-fetch initial images if it's a photo gallery and not cache primed
                    if (initialAlbum.type === 'photo') {
                        await getOrFetchImages(initialAlbum);
                    }

                    setDisplayedAlbums([initialAlbum]);

                    setRelatedAlbums(mappedList
                        .filter(item => item.id !== initialAlbum.id)
                        .slice(0, 10)); // Just take latest
                }
            } catch (err) {
                console.error("Error loading gallery details:", err);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [slug, id]);

    // Scroll to top only on initial Mount/Slug change if FIRST article
    useEffect(() => {
        if (displayedAlbums.length === 1) {
            window.scrollTo(0, 0);
        }
    }, [displayedAlbums.length]);

    // Load next album logic
    const loadNextAlbum = useCallback(async () => {
        if (isLoadingMoreRef.current || displayedAlbumsRef.current.length === 0 || allAlbumsRef.current.length === 0) {
            return;
        }

        const lastAlbum = displayedAlbumsRef.current[displayedAlbumsRef.current.length - 1];
        const currentIndex = allAlbumsRef.current.findIndex(item => item.id === lastAlbum.id && item.type === lastAlbum.type);

        let nextIndex;
        if (currentIndex === -1) {
            nextIndex = 0;
        } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= allAlbumsRef.current.length) {
                nextIndex = 0;
            }
        }

        const nextAlbum = allAlbumsRef.current[nextIndex];

        if (!displayedAlbumsRef.current.find(d => d.id === nextAlbum.id && d.type === nextAlbum.type)) {
            setIsLoadingMore(true);
            
            if (nextAlbum.type === 'photo') {
                await getOrFetchImages(nextAlbum);
            }

            setDisplayedAlbums(prev => [...prev, nextAlbum]);
            setTimeout(() => setIsLoadingMore(false), 100);
        }
    }, []);

    // ... (Observer useEffect remains same)

    // URL Update Handler & View Counter
    const handleAlbumVisible = useCallback((albumItem) => {
        const itemSlug = slugify(albumItem.title);
        const newUrl = albumItem.type === 'video' ? `/video-galeri/${itemSlug}` : `/foto-galeri/${itemSlug}`;

        if (window.location.pathname !== newUrl) {
            window.history.replaceState(null, '', newUrl);
            document.title = `${albumItem.title} | Haberfoni`;
        }

        if (!viewedIds.current.has(`${albumItem.type}-${albumItem.id}`)) {
            if (albumItem.type === 'video') {
                incrementVideoView(albumItem.id).catch(console.error);
            } else {
                incrementPhotoGalleryView(albumItem.id).catch(console.error);
            }
            viewedIds.current.add(`${albumItem.type}-${albumItem.id}`);
            setDisplayedAlbums(prev => prev.map(item =>
                (item.id === albumItem.id && item.type === albumItem.type) ? { ...item, views: (item.views || 0) + 1 } : item
            ));
        }
    }, []);

    if (loading) return <div className="text-center py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    if (displayedAlbums.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">İçerik Bulunamadı</h1>
                <Link to="/foto-galeri" className="text-primary hover:underline">
                    Galeriye Dön
                </Link>
            </div>
        );
    }

    const currentAlbum = displayedAlbums[0];

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title={currentAlbum.seo_title || currentAlbum.title}
                description={currentAlbum.seo_description || `${currentAlbum.title} ${currentAlbum.type === 'video' ? 'videosu' : 'fotoğraf galerisi'}.`}
                url={currentAlbum.type === 'video' ? `/video-galeri/${slug}` : `/foto-galeri/${slug}`}
                image={currentAlbum.thumbnail}
                type="article"
                publishedTime={currentAlbum.published_at}
                modifiedTime={currentAlbum.created_at}
                tags={currentAlbum.seo_keywords ? currentAlbum.seo_keywords.split(',') : ['Galeri', 'Multimedya', 'Haber']}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary">Ana Sayfa</Link>
                    <span>/</span>
                    <Link to="/foto-galeri" className="hover:text-primary">Galeri</Link>
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-md">{currentAlbum.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Infinite Scroll List) */}
                    <div className="lg:col-span-2">
                        {displayedAlbums.map((item, index) => (
                            item.type === 'video' ? (
                                <VideoArticle
                                    key={`video-${item.id}-${index}`}
                                    video={item}
                                    relatedVideos={[]} // Can add if needed
                                    onVisible={handleAlbumVisible}
                                />
                            ) : (
                                <PhotoArticle
                                    key={`photo-${item.id}-${index}`}
                                    album={item}
                                    images={albumImagesCache[item.id] || []}
                                    relatedAlbums={[]}
                                    onVisible={handleAlbumVisible}
                                />
                            )
                        ))}

                        {/* Observer Sentinel */}
                        <div ref={observerTarget} className="h-20 flex items-center justify-center p-4">
                            {displayedAlbums.length < allAlbums.length ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            ) : (
                                <span className="text-gray-400 text-sm">Tüm galeriler görüntülendi.</span>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Sticky Related Albums and Ads */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-[180px] max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2">
                            <div className="mb-6">
                                <AdBanner
                                    placementCode="news_sidebar_sticky"
                                    vertical={true}
                                    customDimensions="300x600"
                                />
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-yellow-500 pb-2 uppercase">
                                    Önerilen Galeriler
                                </h3>
                                <div className="space-y-4">
                                    {relatedAlbums.map((item) => (
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

export default PhotoDetailPage;
