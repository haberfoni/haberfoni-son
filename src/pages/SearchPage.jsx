import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchNews, searchVideos, searchPhotoGalleries } from '../services/api';
import { mapNewsItem, mapVideoItem, mapPhotoGalleryItem } from '../utils/mappers';
import NewsCard from '../components/NewsCard';
import SEO from '../components/SEO';
import { Video, Camera, Image as ImageIcon, Play, FileText } from 'lucide-react';
import { slugify } from '../utils/slugify';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const SearchPage = () => {
    const location = useLocation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({
        news: [],
        videos: [],
        photos: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const q = searchParams.get('q');
        setQuery(q || '');

        if (q) {
            const performSearch = async () => {
                setLoading(true);
                try {
                    const [newsData, videosData, photosData] = await Promise.all([
                        searchNews(q),
                        searchVideos(q),
                        searchPhotoGalleries(q)
                    ]);

                    setResults({
                        news: newsData.map(mapNewsItem),
                        videos: videosData.map(mapVideoItem),
                        photos: photosData.map(mapPhotoGalleryItem)
                    });
                } catch (error) {
                    console.error("Search error:", error);
                } finally {
                    setLoading(false);
                }
            };
            performSearch();
        } else {
            setResults({ news: [], videos: [], photos: [] });
        }
    }, [location.search]);

    const totalResults = results.news.length + results.videos.length + results.photos.length;

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <SEO
                title={query ? `"${query}" Arama Sonuçları` : "Arama"}
                description={query ? `"${query}" için arama sonuçları.` : "Haberfoni'de arama yapın."}
                robots="noindex, follow"
                url="/search"
            />

            <div className="mb-8 border-l-4 border-primary pl-4">
                <h1 className="text-3xl font-bold text-gray-900">
                    "{query}" için Arama Sonuçları
                </h1>
                <p className="text-gray-500 mt-1">
                    Toplam {totalResults} sonuç bulundu.
                </p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Aranıyor...</div>
            ) : totalResults > 0 ? (
                <div className="space-y-12">

                    {/* News Section */}
                    {results.news.length > 0 && (
                        <section>
                            <div className="flex items-center space-x-2 mb-6 border-b border-gray-200 pb-2">
                                <FileText className="text-primary" />
                                <h2 className="text-2xl font-bold text-gray-800">Haberler</h2>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm font-medium">
                                    {results.news.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {results.news.map((item, index) => (
                                    <NewsCard key={`news-${item.id}-${index}`} news={item} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Videos Section */}
                    {results.videos.length > 0 && (
                        <section>
                            <div className="flex items-center space-x-2 mb-6 border-b border-gray-200 pb-2">
                                <Video className="text-red-600" />
                                <h2 className="text-2xl font-bold text-gray-800">Videolar</h2>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm font-medium">
                                    {results.videos.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {results.videos.map((item) => (
                                    <Link key={`video-${item.id}`} to={`/video-galeri/${slugify(item.title)}`} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="relative aspect-video">
                                            <img src={getOptimizedImageUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                                <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                                                    <Play size={20} className="text-red-600 ml-0.5" fill="currentColor" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                {item.duration}
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-red-600 line-clamp-2 mb-2">
                                                {item.title}
                                            </h3>
                                            <div className="text-xs text-gray-400">
                                                {item.date}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Photos Section */}
                    {results.photos.length > 0 && (
                        <section>
                            <div className="flex items-center space-x-2 mb-6 border-b border-gray-200 pb-2">
                                <Camera className="text-yellow-500" />
                                <h2 className="text-2xl font-bold text-gray-800">Foto Galeriler</h2>
                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-sm font-medium">
                                    {results.photos.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {results.photos.map((item) => (
                                    <Link key={`photo-${item.id}`} to={`/foto-galeri/${slugify(item.title)}`} className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                                        <div className="relative aspect-[4/3]">
                                            <img src={getOptimizedImageUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-cover" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                                                <div className="flex items-center space-x-1 text-white text-xs font-bold">
                                                    <ImageIcon size={14} />
                                                    <span>{item.count}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-yellow-600 line-clamp-2 mb-2">
                                                {item.title}
                                            </h3>
                                            <div className="text-xs text-gray-400">
                                                {item.date}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-xl text-gray-600">
                        Aradığınız kriterlere uygun sonuç bulunamadı.
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
