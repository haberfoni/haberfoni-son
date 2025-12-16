import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { slugify } from '../utils/slugify';

import { adminService } from '../services/adminService';

const Surmanset = ({ items = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-slide effect
    React.useEffect(() => {
        if (items.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % Math.min(items.length, 10)); // Limit to top 10
        }, 5000);
        return () => clearInterval(timer);
    }, [items]);

    const displayItems = items.slice(0, 10);

    // Track Views for Active Slide
    React.useEffect(() => {
        if (displayItems.length === 0) return;

        const currentItem = displayItems[currentIndex];
        if (currentItem && (currentItem.type === 'ad' || currentItem.type === 'slider-ad')) {
            const adId = currentItem.adPlacementId || currentItem.adId || currentItem.id.replace('ad-', '').replace('slider-ad-', '');

            // Check session to avoid spamming views in same session if desired, 
            // OR just count every impression. AdBanner uses session check.
            const viewedAds = JSON.parse(sessionStorage.getItem('viewed_headlines') || '[]');
            if (!viewedAds.includes(adId)) {
                adminService.incrementAdView(adId).catch(console.error);
                sessionStorage.setItem('viewed_headlines', JSON.stringify([...viewedAds, adId]));
            }
        }
    }, [currentIndex, displayItems]);

    if (!displayItems.length) return null;

    const goToSlide = (index) => setCurrentIndex(index);
    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);

    const handleAdClick = (item) => {
        const adId = item.adPlacementId || item.adId || item.id.replace('ad-', '').replace('slider-ad-', '');
        adminService.incrementAdClick(adId).catch(console.error);
    };

    return (
        <div className="w-full mb-8 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm group relative">
            <div className="relative h-[400px] w-full overflow-hidden">
                <div
                    className="flex h-full transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {displayItems.map((item, index) => {
                        let linkUrl;
                        const isAd = item.type === 'ad' || item.type === 'slider-ad';
                        if (isAd) {
                            linkUrl = item.link_url;
                            if (linkUrl && !/^https?:\/\//i.test(linkUrl)) {
                                linkUrl = 'https://' + linkUrl;
                            }
                        } else {
                            linkUrl = `/kategori/${slugify(item.category || 'genel')}/${item.slug || slugify(item.title)}`;
                        }

                        const content = (
                            <>
                                <img
                                    src={item.image || item.image_url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                <div className="absolute bottom-12 left-0 w-full p-6 text-center">
                                    {(isAd) && (
                                        <span className="inline-block px-2 py-1 mb-2 text-xs font-semibold text-white bg-orange-500 rounded">
                                            Sponsorlu
                                        </span>
                                    )}
                                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight drop-shadow-md mx-auto max-w-4xl">
                                        {item.title || item.name}
                                    </h2>
                                </div>
                            </>
                        );

                        return (
                            <div key={item.id} className="min-w-full h-full relative">
                                {isAd ? (
                                    <a
                                        href={linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full h-full"
                                        onClick={() => handleAdClick(item)}
                                    >
                                        {content}
                                    </a>
                                ) : (
                                    <Link to={linkUrl} className="block w-full h-full">
                                        {content}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-primary text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-primary text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </button>

                {/* Pagination (Numbered Dots) */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {displayItems.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${currentIndex === index
                                ? 'bg-primary border-primary text-white scale-110'
                                : 'bg-black/50 border-white/50 text-white hover:bg-white hover:text-black'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Surmanset;
