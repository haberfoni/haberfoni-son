import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchNews } from '../services/api';
import { mapNewsItem } from '../utils/mappers';
import NewsCard from '../components/NewsCard';
import SEO from '../components/SEO';

const SearchPage = () => {
    const location = useLocation();
    const [searchResults, setSearchResults] = useState([]);
    const [query, setQuery] = useState('');

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const q = searchParams.get('q');
        setQuery(q || '');

        if (q) {
            const performSearch = async () => {
                const data = await searchNews(q);
                setSearchResults(data.map(mapNewsItem));
            };
            performSearch();
        } else {
            setSearchResults([]);
        }
    }, [location.search]);

    return (
        <div className="container mx-auto px-4 py-8">
            <SEO
                title={query ? `"${query}" Arama Sonuçları` : "Arama"}
                description={query ? `"${query}" için arama sonuçları ve ilgili haberler.` : "Haberfoni'de haber arayın."}
                robots="noindex, follow" // Search pages usually shouldn't be indexed
                url="/search"
            />
            <h1 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-4">
                "{query}" için Arama Sonuçları
            </h1>

            {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {searchResults.map((item, index) => (
                        <NewsCard key={`${item.id}-${index}`} news={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-xl text-gray-600">
                        Aradığınız kriterlere uygun haber bulunamadı.
                    </p>
                    <Link to="/" className="text-primary hover:underline mt-4 inline-block">
                        Anasayfaya Dön
                    </Link>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
