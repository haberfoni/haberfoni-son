import React from 'react';
import Hero from '../components/Hero';
import NewsGrid from '../components/NewsGrid';
import AdBanner from '../components/AdBanner';
import SEO from '../components/SEO';
import { sliderItems, newsItems } from '../data/mockData';

const HomePage = () => {
    // Combine all news items
    const allNews = [...sliderItems, ...newsItems];

    // First 15 items for Hero (Slider + Side List)
    const heroItems = allNews.slice(0, 15);

    // Remaining items for NewsGrid (Latest News)
    const gridItems = allNews.slice(15);

    return (
        <>
            <SEO />
            <div className="bg-gray-100 min-h-screen">
                <div className="container mx-auto px-4 pt-4">
                    <AdBanner />
                </div>
                <Hero items={heroItems} />
                <NewsGrid items={gridItems} />
            </div>
        </>
    );
};

export default HomePage;
