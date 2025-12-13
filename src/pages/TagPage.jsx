import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import AdBanner from '../components/AdBanner';
import { fetchNewsByTag } from '../services/api';
import { mapNewsItem } from '../utils/mappers';
import SEO from '../components/SEO';
import { categories } from '../data/mockData';

const TagPage = () => {
    const { tagSlug } = useParams();
    const ITEMS_PER_PAGE = 12; // Slightly more for tags
    const scrollRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [prevCount, setPrevCount] = useState(ITEMS_PER_PAGE);

    const [newsList, setNewsList] = useState([]);
    const [tagName, setTagName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTagNews = async () => {
            setLoading(true);
            const { name, news } = await fetchNewsByTag(tagSlug);
            setTagName(name || tagSlug); // Fallback to slug if name missing
            setNewsList(news.map(mapNewsItem));
            setLoading(false);
        };
        loadTagNews();
    }, [tagSlug]);

    // Reset visible count when tag changes
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
        setPrevCount(ITEMS_PER_PAGE);
        window.scrollTo(0, 0);
    }, [tagSlug]);

    // Handle scroll after loading more
    useEffect(() => {
        if (visibleCount > prevCount && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setPrevCount(visibleCount);
    }, [visibleCount]);

    const observerTarget = useRef(null);

    const handleLoadMore = useCallback(() => {
        setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < newsList.length) {
                    handleLoadMore();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [handleLoadMore, visibleCount, newsList.length]);

    const displayedNews = newsList.slice(0, visibleCount);

    // Calculate total chunks based on visible count
    const totalChunks = Math.ceil(Math.min(visibleCount, newsList.length) / ITEMS_PER_PAGE);

    return (
        <div className="container mx-auto px-4 py-8">
            <SEO
                title={`${tagName} Haberleri`}
                description={`${tagName} hakkındaki en güncel haberler ve gelişmeler Haberfoni'de.`}
                url={`/etiket/${tagSlug}`}
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-primary pl-4 capitalize">
                #{tagName}
            </h1>

            <div className="mb-8">
                <AdBanner placementCode="category_top" customMobileDimensions="300x250" customHeight="h-[250px] md:h-[250px]" text="Reklam Alani 970x250" />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : newsList.length > 0 ? (
                <div className="flex flex-col gap-8">
                    {Array.from({ length: totalChunks }).map((_, chunkIndex) => {
                        const chunkStart = chunkIndex * ITEMS_PER_PAGE;
                        const chunkEnd = Math.min(chunkStart + ITEMS_PER_PAGE, visibleCount);
                        const chunkItems = newsList.slice(chunkStart, chunkEnd);

                        const newChunkIndex = Math.ceil(prevCount / ITEMS_PER_PAGE);
                        const isPreviousChunk = chunkIndex === newChunkIndex - 1;
                        const isNewChunk = chunkIndex === newChunkIndex;

                        return (
                            <React.Fragment key={chunkIndex}>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4 scroll-mt-40"
                                    ref={isNewChunk ? scrollRef : null}>
                                    {chunkItems.map((news) => (
                                        <NewsCard key={news.id} news={news} />
                                    ))}
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {visibleCount < newsList.length && (
                        <div ref={observerTarget} className="mt-12 text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-gray-400 text-sm mt-2">Daha fazla haber yükleniyor...</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">Bu etikete ait haber bulunmamaktadır.</p>
                </div>
            )}
        </div>
    );
};

export default TagPage;
