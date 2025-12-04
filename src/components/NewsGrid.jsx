import React from 'react';
import NewsCard from './NewsCard';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AdBanner from './AdBanner';

const NewsGrid = ({ items = [] }) => {
    const [visibleCount, setVisibleCount] = React.useState(6);
    const location = useLocation();

    // Reset visible count when navigating/location changes
    React.useEffect(() => {
        setVisibleCount(6);
    }, [location]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };

    // Calculate how many ads to show based on visible rows (3 items per row)
    // We want 1 ad for every 2 rows (6 items), capped at 4 ads (24 items)
    const adCount = Math.min(4, Math.max(1, Math.floor(visibleCount / 6)));

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <AdBanner small />
            </div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary pl-4">
                    Son Dakika
                </h2>
                <Link to="/tum-haberler" className="flex items-center text-primary font-medium hover:text-primary-dark transition-colors">
                    Tümünü Gör <ArrowRight size={16} className="ml-2" />
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* News Column */}
                <div className="lg:w-3/4">
                    {/* Render news in chunks of 6 */}
                    {Array.from({ length: Math.ceil(Math.min(visibleCount, items.length) / 6) }).map((_, chunkIndex) => {
                        const chunkStart = chunkIndex * 6;
                        const chunkEnd = Math.min(chunkStart + 6, visibleCount);
                        const chunkItems = items.slice(chunkStart, chunkEnd);

                        return (
                            <React.Fragment key={chunkIndex}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    {chunkItems.map((news) => (
                                        <NewsCard key={news.id} news={news} />
                                    ))}
                                </div>
                                {/* Insert Ad after every 6 items, but not after the last chunk if it's the end of data, and stop after 24 items (4 chunks * 6 = 24) */}
                                {chunkEnd < visibleCount && chunkEnd < 24 && (
                                    <div className="mb-8">
                                        <AdBanner />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Sidebar Ad Column */}
                <div className="lg:w-1/4">
                    <div className="flex flex-col gap-8">
                        {Array.from({ length: adCount }).map((_, index) => (
                            <AdBanner key={index} vertical={true} customHeight="h-[780px]" customDimensions="300x780" />
                        ))}
                    </div>
                </div>
            </div>

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
        </section>
    );
};

export default NewsGrid;
