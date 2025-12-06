import React, { useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import { fetchNews } from '../services/api';
import { mapNewsItem } from '../utils/mappers';
import SEO from '../components/SEO';

const AllNewsPage = () => {
    const [allNews, setAllNews] = React.useState([]);

    useEffect(() => {
        const loadNews = async () => {
            const data = await fetchNews();
            setAllNews(data.map(mapNewsItem));
        };
        loadNews();
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <SEO
                title="Tüm Haberler"
                description="Haberfoni'deki tüm güncel haberler, son dakika gelişmeleri ve arşiv."
                url="/tum-haberler"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-primary pl-4">
                Tüm Haberler
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allNews.map((news) => (
                    <NewsCard key={news.id} news={news} />
                ))}
            </div>
        </div>
    );
};

export default AllNewsPage;
