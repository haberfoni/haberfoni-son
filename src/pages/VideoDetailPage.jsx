import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { fetchVideos, fetchVideoDetail, incrementVideoView } from '../services/api';
import { mapVideoItem } from '../utils/mappers';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';
import VideoArticle from '../components/VideoArticle';
import AdBanner from '../components/AdBanner';

const VideoDetailPage = () => {
    const { slug, id } = useParams();

    const [displayedVideos, setDisplayedVideos] = useState([]);
    const [allVideos, setAllVideos] = useState([]);
    const [relatedVideos, setRelatedVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const observerTarget = useRef(null);
    const viewedIds = useRef(new Set());

    // Refs for stable callbacks
    const displayedVideosRef = useRef(displayedVideos);
    const allVideosRef = useRef(allVideos);
    const isLoadingMoreRef = useRef(isLoadingMore);

    useEffect(() => {
        displayedVideosRef.current = displayedVideos;
        allVideosRef.current = allVideos;
        isLoadingMoreRef.current = isLoadingMore;
    }, [displayedVideos, allVideos, isLoadingMore]);

    // Initial load
    useEffect(() => {
        // Prevent reloading if we are already showing this video as the first item
        if (displayedVideos.length > 0 && String(displayedVideos[0].id) === String(id)) {
            return;
        }

        setDisplayedVideos([]);
        setIsLoadingMore(false);

        const loadContent = async () => {
            setLoading(true);
            try {
                let initialVideo = null;

                if (id) {
                    const detail = await fetchVideoDetail(id);
                    if (detail) initialVideo = mapVideoItem(detail);
                }

                const videosList = await fetchVideos();
                const mappedList = videosList.map(mapVideoItem);
                setAllVideos(mappedList);

                if (!initialVideo) {
                    initialVideo = mappedList.find(item => slugify(item.title) === slug);
                }

                if (initialVideo) {
                    setDisplayedVideos([initialVideo]);

                    // Set related sidebar
                    setRelatedVideos(mappedList
                        .filter(item => item.id !== initialVideo.id)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 5));
                }
            } catch (err) {
                console.error("Error loading videos:", err);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [slug, id]);

    // Scroll to top only on initial Mount/Slug change if it is the FIRST article
    useEffect(() => {
        if (displayedVideos.length === 1) {
            window.scrollTo(0, 0);
        }
    }, [displayedVideos.length]);

    // Load next video logic
    const loadNextVideo = useCallback(() => {
        if (isLoadingMoreRef.current || displayedVideosRef.current.length === 0 || allVideosRef.current.length === 0) {
            return;
        }

        const lastVideo = displayedVideosRef.current[displayedVideosRef.current.length - 1];
        const currentIndex = allVideosRef.current.findIndex(item => item.id === lastVideo.id);

        let nextIndex;
        if (currentIndex === -1) {
            nextIndex = 0;
        } else {
            nextIndex = currentIndex + 1;
            if (nextIndex >= allVideosRef.current.length) {
                nextIndex = 0; // Loop back
            }
        }

        const nextVideo = allVideosRef.current[nextIndex];

        if (!displayedVideosRef.current.find(d => d.id === nextVideo.id)) {
            setIsLoadingMore(true);
            setDisplayedVideos(prev => [...prev, nextVideo]);
            setTimeout(() => setIsLoadingMore(false), 100);
        }
    }, []);

    // Setup intersection observer
    useEffect(() => {
        if (loading || displayedVideos.length === 0) return;

        let observer = null;
        const timer = setTimeout(() => {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        loadNextVideo();
                    }
                },
                { threshold: 0.1, rootMargin: '200px' }
            );

            if (observerTarget.current) {
                observer.observe(observerTarget.current);
            }
        }, 0);

        return () => {
            clearTimeout(timer);
            if (observer && observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loadNextVideo, loading, displayedVideos.length]);

    // URL Update Handler & View Counter
    const handleVideoVisible = useCallback((v) => {
        const itemSlug = slugify(v.title);
        const newUrl = `/video-galeri/${itemSlug}`;

        if (window.location.pathname !== newUrl) {
            window.history.replaceState(null, '', newUrl);
            document.title = `${v.title} | Haberfoni`;
        }

        if (!viewedIds.current.has(v.id)) {
            incrementVideoView(v.id).catch(console.error);
            viewedIds.current.add(v.id);
            setDisplayedVideos(prev => prev.map(item =>
                item.id === v.id ? { ...item, views: (item.views || 0) + 1 } : item
            ));
        }
    }, []);

    if (loading) return <div className="text-center py-20 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    if (displayedVideos.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Video Bulunamadı</h1>
                <Link to="/video-galeri" className="text-primary hover:underline">
                    Video Galerisine Dön
                </Link>
            </div>
        );
    }

    const currentVideo = displayedVideos[0];

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title={currentVideo.seo_title || currentVideo.title}
                description={currentVideo.seo_description || `${currentVideo.title} videosunu izle.`}
                url={`/video-galeri/${slug}`}
                image={currentVideo.thumbnail}
                type="video.other"
                publishedTime={currentVideo.published_at}
                modifiedTime={currentVideo.created_at}
                tags={currentVideo.seo_keywords ? currentVideo.seo_keywords.split(',') : ['Video', 'Haber', 'Galeri']}
            />

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb based on the first video loaded context */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary">Ana Sayfa</Link>
                    <span>/</span>
                    <Link to="/video-galeri" className="hover:text-primary">Video Galeri</Link>
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-md">{currentVideo.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content (Infinite Scroll List) */}
                    <div className="lg:col-span-2">
                        {displayedVideos.map((v, index) => (
                            <VideoArticle
                                key={`${v.id}-${index}`}
                                video={v}
                                relatedVideos={index % 2 === 0 ? [] : relatedVideos} // Optional inline related display
                                onVisible={handleVideoVisible}
                            />
                        ))}

                        {/* Observer Sentinel */}
                        <div ref={observerTarget} className="h-20 flex items-center justify-center p-4">
                            {displayedVideos.length < allVideos.length ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            ) : (
                                <span className="text-gray-400 text-sm">Tüm videolar görüntülendi.</span>
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
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-red-600 pb-2 uppercase">
                                    Önerilen Videolar
                                </h3>
                                <div className="space-y-4">
                                    {relatedVideos.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={`/video-galeri/${slugify(item.title)}`}
                                            className="flex space-x-3 group"
                                        >
                                            <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded">
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10">
                                                    <Play size={16} className="text-white" fill="currentColor" />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <span>{item.date}</span>
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
