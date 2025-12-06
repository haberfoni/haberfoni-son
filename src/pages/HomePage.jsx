import React from 'react';
import Hero from '../components/Hero';
import NewsGrid from '../components/NewsGrid';
import AdBanner from '../components/AdBanner';
import SEO from '../components/SEO';
import { fetchNews, fetchSliderNews } from '../services/api';
import { mapNewsItem } from '../utils/mappers';

const HomePage = () => {
    const [heroItems, setHeroItems] = React.useState([]);
    const [gridItems, setGridItems] = React.useState([]);

    React.useEffect(() => {
        const loadNews = async () => {
            // Fetch slider news (is_slider = true)
            const sliderData = await fetchSliderNews();
            const mappedSliderData = sliderData.map(mapNewsItem);
            setHeroItems(mappedSliderData);

            // Fetch all news for grid
            const allNews = await fetchNews();
            const mappedNews = allNews.map(mapNewsItem);
            setGridItems(mappedNews);
        };
        loadNews();
    }, []);

    return (
        <>
            <SEO />
            <div className="bg-gray-100 min-h-screen">
                <div className="container mx-auto px-4 pt-4">
                    <AdBanner placementCode="home_top" customMobileDimensions="320x100" customHeight="h-[100px] md:h-[250px]" />
                </div>
                <Hero items={heroItems} />
                <NewsGrid items={gridItems} />
            </div>
        </>
    );
};

export default HomePage;
