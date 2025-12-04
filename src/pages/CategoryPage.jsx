import React from 'react';
import { useParams } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import { newsItems, sliderItems } from '../data/mockData';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';

const CategoryPage = () => {
    const { categoryName } = useParams();

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

            {categoryNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryNews.map((news) => (
                        <NewsCard key={news.id} news={news} />
                    ))}
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
