import React from 'react';
import NewsCard from './NewsCard';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AdBanner from './AdBanner';

const NewsGrid = ({ items = [] }) => {
    const scrollRef = React.useRef(null);
    const location = useLocation();

    const [visibleCount, setVisibleCount] = React.useState(16);
    const [prevCount, setPrevCount] = React.useState(16);

    // Reset visible count when navigating/location changes
    React.useEffect(() => {
        setVisibleCount(16);
    }, [location]);

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

    // Calculate total chunks based on visible count
    const totalChunks = Math.ceil(Math.min(visibleCount, items.length) / 16);

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <AdBanner customMobileDimensions="300x250" customHeight="h-[250px] md:h-[250px]" text="Reklam Alani 970x250" />
            </div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary pl-4">
                    Son Dakika
                </h2>
                <Link to="/tum-haberler" className="flex items-center text-primary font-medium hover:text-primary-dark transition-colors">
                    Tümünü Gör <ArrowRight size={16} className="ml-2" />
                </Link>
            </div>

            <div className="flex flex-col gap-8">
                {Array.from({ length: totalChunks }).map((_, chunkIndex) => {
                    const chunkStart = chunkIndex * 16;
                    const chunkEnd = Math.min(chunkStart + 16, visibleCount);
                    const chunkItems = items.slice(chunkStart, chunkEnd);

                    const newChunkIndex = Math.ceil(prevCount / 16);
                    const isPreviousChunk = chunkIndex === newChunkIndex - 1;
                    const isNewChunk = chunkIndex === newChunkIndex;

                    // Horizontal ad logic: show after chunk if not the last chunk of data and within limit (64 items / 4 chunks)
                    const showHorizontalAd = chunkEnd < visibleCount && chunkEnd < 64;

                    // Sidebar ad logic: show for every chunk up to 4 chunks (matching previous limit)
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
                                            <NewsCard key={news.id} news={news} />
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

                {visibleCount < items.length && (
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
        </section>
    );
};

export default NewsGrid;
