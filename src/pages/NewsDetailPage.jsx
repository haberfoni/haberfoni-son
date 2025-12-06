import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchNewsByCategory, fetchNews, fetchRelatedNews, fetchNewsDetail, incrementNewsView } from '../services/api';
import { mapNewsItem } from '../utils/mappers';
import NewsCard from '../components/NewsCard';
import AdBanner from '../components/AdBanner';
import SEO from '../components/SEO';
import ErrorBoundary from '../components/ErrorBoundary';
import NewsArticle from '../components/NewsArticle';
import { slugify } from '../utils/slugify';

const NewsDetailPage = () => {
    const { category, slug } = useParams();
    // Start with empty list
    const [displayedNews, setDisplayedNews] = useState([]);
    const [allCategoryNews, setAllCategoryNews] = useState([]);
    const [relatedNews, setRelatedNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const observerTarget = useRef(null);
    const viewedIds = useRef(new Set());

    // Initial load: Fetch all category news and set the initial article based on slug
    useEffect(() => {
        const loadInitialNews = async () => {
            setLoading(true);
            const data = await fetchNewsByCategory(category);
            const mappedData = data.map(mapNewsItem);
            setAllCategoryNews(mappedData);

            // Find the requested news item from the list
            // Match custom slug OR generated slug (backward compatibility)
            const matchedItem = mappedData.find(item =>
                (item.slug && item.slug === slug) ||
                (!item.slug && slugify(item.title) === slug)
            );

            if (matchedItem) {
                // Fetch FULL details (including content) for this item
                const fullNewsData = await fetchNewsDetail(matchedItem.id);

                // Map the full data (handling the case where fetchNewsDetail might fail or return different structure)
                const currentNews = fullNewsData ? mapNewsItem(fullNewsData) : matchedItem;

                // If not published, add noindex
                if (!currentNews.is_published) {
                    const meta = document.createElement('meta');
                    meta.name = 'robots';
                    meta.content = 'noindex';
                    document.head.appendChild(meta);
                }

                // Increment view count
                incrementNewsView(matchedItem.id);

                // Initialize displayed news with the current one
                setDisplayedNews([currentNews]);

                // Load related news
                const relatedData = await fetchRelatedNews(currentNews.id);
                const mappedRelated = relatedData.map(mapNewsItem);
                setRelatedNews(mappedRelated);
            }
            setLoading(false);
        };
        loadInitialNews();

        // Reset displayed news when slug/cat changes manually (e.g. from nav)
        setDisplayedNews([]);
    }, [category, slug]);

    // Scroll to top only on initial Mount/Slug change if it is the FIRST article
    useEffect(() => {
        if (displayedNews.length === 1) {
            window.scrollTo(0, 0);
        }
    }, [displayedNews.length]);

    // Infinite Scroll Logic
    const loadNextArticle = useCallback(() => {
        if (displayedNews.length === 0 || allCategoryNews.length === 0) return;

        const lastArticle = displayedNews[displayedNews.length - 1];
        const currentIndex = allCategoryNews.findIndex(item => item.id === lastArticle.id);

        if (currentIndex !== -1 && currentIndex < allCategoryNews.length - 1) {
            const nextArticle = allCategoryNews[currentIndex + 1];
            // Avoid duplicates just in case
            if (!displayedNews.find(d => d.id === nextArticle.id)) {
                setDisplayedNews(prev => [...prev, nextArticle]);
            }
        }
    }, [displayedNews, allCategoryNews]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadNextArticle();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [loadNextArticle]);

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

    return (
        <ErrorBoundary>
            {currentNews && (
                <SEO
                    title={currentNews.title}
                    description={currentNews.summary}
                    image={currentNews.image}
                    url={`/kategori/${slugify(currentNews.category)}/${slugify(currentNews.title)}`}
                    type="article"
                    publishedTime={new Date().toISOString()}
                    author="Haberfoni Editörü"
                    tags={[currentNews.category, 'Haber', 'Gündem']}
                />
            )}

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb & Back (Static for the first article context) */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/" className="flex items-center text-gray-500 hover:text-primary transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Ana Sayfa
                    </Link>
                    {currentNews && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Link to={`/kategori/${slugify(currentNews.category)}`} className="hover:text-primary">
                                {currentNews.category}
                            </Link>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content - Maps over Displayed News */}
                    <div className="lg:col-span-2">
                        {displayedNews.map((newsItem, index) => (
                            <NewsArticle
                                key={`${newsItem.id}-${index}`}
                                news={newsItem}
                                onVisible={handleArticleVisible}
                            />
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
                                    <div className="grid grid-cols-2 gap-4">
                                        {relatedNews.map((item, index) => (
                                            <React.Fragment key={item.id}>
                                                <NewsCard news={item} compact={true} />
                                                {/* Inject Ad after every 8th item (4 rows) */}
                                                {(index + 1) % 8 === 0 && index !== relatedNews.length - 1 && (
                                                    <div className="col-span-2 py-4">
                                                        <AdBanner placementCode="sidebar_1" vertical={true} customDimensions="300x250" customHeight="h-[250px]" text="Reklam Alanı 1 (300x250)" />
                                                    </div>
                                                )}
                                            </React.Fragment>
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
