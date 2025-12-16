import React from 'react';
import NewsCard from './NewsCard';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AdBanner from './AdBanner';
const NewsGrid = ({ items = [] }) => {
    // Determine how many items to show initially (e.g. 50 or all passed).
    // User asked to remove "Load More" logic. So we just show what we have.
    // Assuming 'items' is already limited by parent or API (we will limit API next).

    // We can still use chunks for ad placement logic (every 16 items insert ad).
    // But we won't hide items or show a button.

    const ITEMS_PER_CHUNK = 16;
    const totalChunks = Math.ceil(items.length / ITEMS_PER_CHUNK);

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="mb-8">
                <AdBanner placementCode="home_list_top" customMobileDimensions="300x250" customHeight="h-[250px] md:h-[250px]" text="Reklam Alani 970x250" />
            </div>

            {/* Surmanset Removed from here - moved to HomePage */}
            {/* Son Dakika header removed - now in BreakingNews component */}

            <div className="flex flex-col gap-8">
                {items.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Yükleniyor veya haber bulunamadı...
                    </div>
                ) : (
                    Array.from({ length: totalChunks }).map((_, chunkIndex) => {
                        const chunkStart = chunkIndex * ITEMS_PER_CHUNK;
                        const chunkEnd = chunkStart + ITEMS_PER_CHUNK;
                        const chunkItems = items.slice(chunkStart, chunkEnd);

                        // Horizontal ad logic: show after chunk if not the last chunk of data and within limit
                        // We show generic ads for now 
                        const showHorizontalAd = chunkIndex < 4 && chunkEnd < items.length;

                        // Sidebar ad logic: always show sidebar ads
                        const showSidebarAd = true; // Changed from chunkIndex < 4
                        const isLastSidebarAd = chunkIndex === Math.min(totalChunks, 4) - 1;

                        return (
                            <React.Fragment key={chunkIndex}>
                                <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left Column: News Grid */}
                                    <div className="lg:w-3/4">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-8">
                                            {chunkItems.map((news) => (
                                                <NewsCard key={news.id} news={news} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Column: Sidebar Ad */}
                                    {showSidebarAd && (
                                        <div className="lg:w-1/4">
                                            {isLastSidebarAd && chunkIndex > 0 ? (
                                                <div>
                                                    <AdBanner
                                                        placementCode="sidebar_sticky"
                                                        vertical={true}
                                                        customDimensions="300x600"
                                                        customHeight="h-[250px] md:h-[600px]"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-4 h-full justify-start">
                                                    <AdBanner
                                                        placementCode="sidebar_1"
                                                        vertical={true}
                                                        customDimensions="300x250"
                                                        customHeight="h-[250px] md:h-[250px]"
                                                    />
                                                    <AdBanner
                                                        placementCode="sidebar_2"
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
                                    <div className="mb-8">
                                        <AdBanner
                                            placementCode={chunkIndex === 0 ? "home_horizontal" : `home_horizontal_${chunkIndex + 1}`}
                                            customDimensions="970x250"
                                            customMobileDimensions="300x250"
                                            customHeight="h-[250px] md:h-[250px]"
                                        />
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })
                )}
            </div>
        </section >
    );
};

export default NewsGrid;
