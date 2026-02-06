import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchNewsByCategory, fetchPopularNews, fetchNews, fetchRelatedNews, fetchNewsDetail, incrementNewsView, fetchNewsBySlug } from '../services/api';
import { mapNewsItem } from '../utils/mappers';
import NewsCard from '../components/NewsCard';
import AdBanner from '../components/AdBanner';
import SEO from '../components/SEO';
import ErrorBoundary from '../components/ErrorBoundary';
import NewsArticle from '../components/NewsArticle';
import { slugify } from '../utils/slugify';

const NewsDetailPage = () => {
    const { category, slug, id } = useParams();
    const location = useLocation();
    const isFromSlider = new URLSearchParams(location.search).get('from') === 'slider';
    // Start with empty list
    const [displayedNews, setDisplayedNews] = useState([]);
    const [allCategoryNews, setAllCategoryNews] = useState([]);
    const [relatedNews, setRelatedNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef(null);
    const viewedIds = useRef(new Set());

    // Initial load: Fetch specific news first, then category news
    useEffect(() => {
        // Reset displayed news when slug/cat changes
        // Only reset if we are navigating to a completely new article context
        if (displayedNews.length > 0 && String(displayedNews[0].id) === String(id)) {
            return; // Already showing this article
        }

        setDisplayedNews([]);
        setIsLoadingMore(false);

        const loadInitialNews = async () => {
            setLoading(true);

            try {
                let initialNewsItem = null;

                // 1. Try to fetch specific item by ID (Best)
                if (id) {
                    const detail = await fetchNewsDetail(id);
                    if (detail) {
                        initialNewsItem = mapNewsItem(detail);
                    }
                }

                // 2. Fetch Category News (for Infinite Scroll)
                const listData = isFromSlider
                    ? await fetchPopularNews(100)
                    : await fetchNewsByCategory(category);

                const mappedList = listData.map(mapNewsItem);
                setAllCategoryNews(mappedList);

                // 3. Fallback matching if ID didn't work or wasn't present
                if (!initialNewsItem) {
                    initialNewsItem = mappedList.find(item =>
                        (item.slug && item.slug === slug) ||
                        (!item.slug && slugify(item.title) === slug)
                    );

                    // If still not found, try explicit fetch by slug
                    if (!initialNewsItem && slug) {
                        try {
                            const bySlug = await fetchNewsBySlug(slug, category);
                            if (bySlug) initialNewsItem = mapNewsItem(bySlug);
                        } catch (e) {
                            console.error("Fallback fetch by slug failed:", e);
                        }
                    }

                    // If found in list, we might want to fetch full details
                    if (initialNewsItem) {
                        const fullDetail = await fetchNewsDetail(initialNewsItem.id);
                        if (fullDetail) initialNewsItem = mapNewsItem(fullDetail);
                    }
                }

                if (initialNewsItem) {
                    setDisplayedNews([initialNewsItem]);

                    // Load related news
                    const relatedData = await fetchRelatedNews(initialNewsItem.id, initialNewsItem.category);
                    const mappedRelated = relatedData.map(mapNewsItem);
                    setRelatedNews(mappedRelated);
                }
            } catch (err) {
                console.error("Error loading news detail:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialNews();
    }, [category, slug, id]);

    // Scroll to top only on initial Mount/Slug change if it is the FIRST article
    useEffect(() => {
        if (displayedNews.length === 1) {
            window.scrollTo(0, 0);
        }
    }, [displayedNews.length]);

    // Use refs to avoid recreating observer on every state change
    const displayedNewsRef = useRef(displayedNews);
    const allCategoryNewsRef = useRef(allCategoryNews);
    const isLoadingMoreRef = useRef(isLoadingMore);

    // Keep refs in sync with state
    useEffect(() => {
        displayedNewsRef.current = displayedNews;
        allCategoryNewsRef.current = allCategoryNews;
        isLoadingMoreRef.current = isLoadingMore;
    }, [displayedNews, allCategoryNews, isLoadingMore]);

    // Infinite Scroll Logic - stable function that uses refs
    const loadNextArticle = useCallback(() => {
        if (isLoadingMoreRef.current) {
            console.log('Already loading, skipping...');
            return;
        }
        if (displayedNewsRef.current.length === 0 || allCategoryNewsRef.current.length === 0) {
            console.log('No data available for infinite scroll');
            return;
        }

        const lastArticle = displayedNewsRef.current[displayedNewsRef.current.length - 1];
        const currentIndex = allCategoryNewsRef.current.findIndex(item => item.id === lastArticle.id);

        console.log('Infinite scroll triggered:', {
            currentIndex,
            totalNews: allCategoryNewsRef.current.length,
            displayedCount: displayedNewsRef.current.length
        });


        let nextIndex;

        // If current article isn't in the list (e.g. opened from slider/search), start from beginning
        if (currentIndex === -1) {
            console.log('Current article not in list, starting from first article');
            nextIndex = 0;
        } else {
            nextIndex = currentIndex + 1;

            // If we've reached the end, loop back to the beginning
            if (nextIndex >= allCategoryNewsRef.current.length) {
                nextIndex = 0;
                console.log('Reached end of category, looping back to start');
            }
        }

        const nextArticle = allCategoryNewsRef.current[nextIndex];

        // Avoid duplicates
        if (!displayedNewsRef.current.find(d => d.id === nextArticle.id)) {
            console.log('Loading next article:', nextArticle.title);
            setIsLoadingMore(true);
            setDisplayedNews(prev => [...prev, nextArticle]);
            // Reset loading state immediately after state update
            setTimeout(() => {
                setIsLoadingMore(false);
                console.log('Loading state reset');
            }, 100);
        } else {
            console.log('Next article already in list (circular loop detected), stopping');
            setIsLoadingMore(false);
        }
    }, []); // Empty deps - function is now stable

    useEffect(() => {
        // Don't set up observer until we have content AND loading is complete
        if (loading || displayedNews.length === 0) {
            console.log('Skipping observer setup - loading:', loading, 'displayedNews.length:', displayedNews.length);
            return;
        }

        console.log('Setting up IntersectionObserver for category:', category, 'slug:', slug);

        let observer = null;

        // Use setTimeout 0 to ensure ref is attached after React finishes rendering
        const timer = setTimeout(() => {
            observer = new IntersectionObserver(
                (entries) => {
                    console.log('Observer triggered, isIntersecting:', entries[0].isIntersecting);
                    if (entries[0].isIntersecting) {
                        loadNextArticle();
                    }
                },
                { threshold: 0.1, rootMargin: '200px' }
            );

            if (observerTarget.current) {
                observer.observe(observerTarget.current);
                console.log('✅ Observer attached to target successfully');
            } else {
                console.error('❌ Observer target ref is still null after timeout!');
            }
        }, 0);

        return () => {
            clearTimeout(timer);
            if (observer && observerTarget.current) {
                observer.unobserve(observerTarget.current);
                console.log('Observer cleaned up');
            }
        };
    }, [loadNextArticle, category, slug, displayedNews.length, loading]); // Also depend on loading

    // URL Update Handler & View Counter
    const handleArticleVisible = useCallback((newsItem) => {
        const itemSlug = newsItem.slug || slugify(newsItem.title);
        const newUrl = `/kategori/${slugify(newsItem.category)}/${itemSlug}`;
        // Update URL without reloading page if it's different
        if (window.location.pathname !== newUrl) {
            window.history.replaceState(null, '', newUrl);
            document.title = `${newsItem.title} | Haberfoni`; // Update title too
        }

        // Increment view count if not already viewed in this session
        if (!viewedIds.current.has(newsItem.id)) {
            incrementNewsView(newsItem.id);
            viewedIds.current.add(newsItem.id);

            // Update local state to show incremented view count immediately
            setDisplayedNews(prev => prev.map(item =>
                item.id === newsItem.id
                    ? { ...item, views: (item.views || 0) + 1 }
                    : item
            ));
        }
    }, []);

    // If loading, show spinner
    if (loading) {
        return (
            <div className="flex justify-center py-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If no news found (and not loading), show error
    if (displayedNews.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Haber Bulunamadı</h2>
                <Link to="/" className="text-primary hover:underline">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    const currentNews = displayedNews[0]; // Primary news for SEO



    const expectedUrl = `/kategori/${slugify(currentNews.category)}/${currentNews.slug || slugify(currentNews.title)}`;

    // DEBUG: Check if SEO data is present
    console.log('NewsDetailPage currentNews:', {
        id: currentNews.id,
        title: currentNews.title,
        seo_description: currentNews.seo_description,
        seo_keywords: currentNews.seo_keywords,
        summary: currentNews.summary
    });

    return (
        <ErrorBoundary>
            {currentNews && (
                <SEO
                    title={currentNews.seo_title || currentNews.title}
                    description={currentNews.seo_description || currentNews.summary}
                    image={currentNews.image_url}
                    url={`/kategori/${slugify(currentNews.category)}/${currentNews.slug || slugify(currentNews.title)}`}
                    type="article"
                    publishedTime={currentNews.published_at}
                    modifiedTime={currentNews.updated_at}
                    author="Haberfoni Editörü"
                    tags={currentNews.seo_keywords ? currentNews.seo_keywords.split(',') : [currentNews.category, 'Haber', 'Gündem']}
                    noIndex={!currentNews.is_published}
                />
            )}

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb & Back (Static for the first article context) */}
                <div className="flex items-center justify-start space-x-4 mb-6">
                    <Link to="/" className="flex items-center text-gray-500 hover:text-primary transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Ana Sayfa
                    </Link>
                    {currentNews && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Link to={`/kategori/${slugify(currentNews.category)}`} className="hover:text-primary capitalize">
                                {currentNews.category}
                            </Link>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content - Maps over Displayed News */}
                    <div className="lg:col-span-2">
                        {displayedNews.map((newsItem, index) => (
                            <div key={`${newsItem.id}-${index}`}>
                                <NewsArticle
                                    news={newsItem}
                                    onVisible={handleArticleVisible}
                                />
                            </div>
                        ))}

                        {/* Observer Sentinel */}
                        <div ref={observerTarget} className="h-20 flex items-center justify-center p-4">
                            {displayedNews.length < allCategoryNews.length ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            ) : (
                                <span className="text-gray-400 text-sm">Tüm haberler görüntülendi.</span>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Related News (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-[180px] max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2">
                            {relatedNews.length > 0 && (
                                <div className="mb-0">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-primary pl-4">
                                        Benzer Haberler
                                    </h3>

                                    {/* Ad Banner Above Related News */}
                                    <div className="mb-4">
                                        <AdBanner
                                            placementCode="news_sidebar_sticky"
                                            vertical={true}
                                            customDimensions="300x250"
                                            customHeight="h-[250px]"
                                            newsId={currentNews?.id}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {relatedNews.map((item) => (
                                            <NewsCard key={item.id} news={item} compact={true} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default NewsDetailPage;
