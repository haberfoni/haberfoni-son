import React from 'react';
import { useParams } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import AdBanner from '../components/AdBanner';
import { newsItems, sliderItems } from '../data/mockData';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';

const CategoryPage = () => {
    const { categoryName } = useParams();
    const scrollRef = React.useRef(null);
    const [visibleCount, setVisibleCount] = React.useState(16);
    const [prevCount, setPrevCount] = React.useState(16);

    // Combine all news items for filtering
    const allNews = [...sliderItems, ...newsItems];

    // Filter news by category (slug comparison)
    const categoryNews = allNews.filter(
        item => slugify(item.category) === categoryName
    );

    // Get display name from the first item found or capitalize slug
    const displayCategoryName = categoryNews.length > 0
        ? categoryNews[0].category
        : categoryName?.charAt(0).toUpperCase() + categoryName?.slice(1);

    // Reset visible count when category changes
    React.useEffect(() => {
        setVisibleCount(16);
        setPrevCount(16);
        window.scrollTo(0, 0);
    }, [categoryName]);

    // Handle scroll after loading more
    React.useEffect(() => {
        if (visibleCount > prevCount && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setPrevCount(visibleCount);
    }, [visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 16);
    };

    const displayedNews = categoryNews.slice(0, visibleCount);

    // Calculate total chunks based on visible count
    const totalChunks = Math.ceil(Math.min(visibleCount, categoryNews.length) / 16);

    return (
        <div className="container mx-auto px-4 py-8">
            <SEO
                title={`${displayCategoryName} Haberleri`}
                description={`${displayCategoryName} kategorisindeki en güncel haberler ve son dakika gelişmeleri Haberfoni'de.`}
                url={`/kategori/${categoryName}`}
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-primary pl-4">
                {displayCategoryName} Haberleri
            </h1>

            <div className="mb-8">
                <AdBanner customMobileDimensions="300x250" customHeight="h-[250px] md:h-[250px]" text="Reklam Alani 970x250" />
            </div>

            {categoryNews.length > 0 ? (
                <div className="flex flex-col gap-8">
                    {Array.from({ length: totalChunks }).map((_, chunkIndex) => {
                        const chunkStart = chunkIndex * 16;
                        const chunkEnd = Math.min(chunkStart + 16, visibleCount);
                        const chunkItems = categoryNews.slice(chunkStart, chunkEnd);

                        const newChunkIndex = Math.ceil(prevCount / 16);
                        const isPreviousChunk = chunkIndex === newChunkIndex - 1;
                        const isNewChunk = chunkIndex === newChunkIndex;

                        // Horizontal ad logic: show after chunk if not the last chunk of data and within limit (64 items / 4 chunks)
                        const showHorizontalAd = chunkEnd < visibleCount && chunkEnd < 64;

                        // Sidebar ad logic: show for every chunk up to 4 chunks
                        const showSidebarAd = chunkIndex < 4;
                        const isLastSidebarAd = chunkIndex === Math.min(totalChunks, 4) - 1;

                        return (
                            <React.Fragment key={chunkIndex}>
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left Column: News Grid */}
                                    <div className="lg:w-3/4">
                                        <div
                                            className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-8 scroll-mt-40"
                                            ref={isNewChunk && !((chunkIndex * 16) < 64) ? scrollRef : null}
                                        >
                                            {chunkItems.map((news) => (
                                                <div key={news.id} className="contents">
                                                    <NewsCard news={news} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Column: Sidebar Ad */}
                                    {showSidebarAd && (
                                        <div className="lg:w-1/4 hidden lg:block">
                                            {isLastSidebarAd && chunkIndex > 0 ? (
                                                <div className="sticky top-40">
                                                    <AdBanner
                                                        vertical={true}
                                                        customDimensions="300x600"
                                                        customHeight="h-[250px] md:h-[600px]"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-4">
                                                    <AdBanner
                                                        vertical={true}
                                                        customDimensions="300x250"
                                                        customHeight="h-[250px] md:h-[250px]"
                                                    />
                                                    <AdBanner
                                                        vertical={true}
                                                        customDimensions="300x250"
                                                        customHeight="h-[250px] md:h-[250px]"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Full Width Horizontal Ad */}
                                {showHorizontalAd && (
                                    <div className="mb-8 scroll-mt-40" ref={isPreviousChunk ? scrollRef : null}>
                                        <AdBanner customDimensions="970x250" customMobileDimensions="300x250" customHeight="h-[250px] md:h-[250px]" text="Reklam Alani 970x250" />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}

                    {visibleCount < categoryNews.length && (
                        <div className="mt-12 text-center">
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                            >
                                Daha Fazla Haber Yükle
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">Bu kategoride henüz haber bulunmamaktadır.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryPage;
