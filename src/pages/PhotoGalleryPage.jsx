import React from 'react';
import { Camera, Clock, Eye, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner'; // Import AdBanner
import { fetchPhotoGalleries } from '../services/api';
import { mapPhotoGalleryItem } from '../utils/mappers';
import { slugify } from '../utils/slugify';

const PhotoGalleryPage = () => {
    const [featuredAlbum, setFeaturedAlbum] = React.useState(null);
    const [mostViewed, setMostViewed] = React.useState([]);
    const [latestAlbums, setLatestAlbums] = React.useState([]);
    const [visibleCount, setVisibleCount] = React.useState(20);
    const [prevCount, setPrevCount] = React.useState(20);
    const scrollRef = React.useRef(null);

    // Handle scroll after loading more
    React.useEffect(() => {
        if (visibleCount > prevCount && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setPrevCount(visibleCount);
    }, [visibleCount]);

    React.useEffect(() => {
        const loadGalleries = async () => {
            const data = await fetchPhotoGalleries();
            const mappedData = data.map(mapPhotoGalleryItem);

            if (mappedData.length > 0) {
                setFeaturedAlbum(mappedData[0]);

                // Sort by views (descending) and take top 5
                const sortedByViews = [...mappedData].sort((a, b) => (b.views || 0) - (a.views || 0));
                setMostViewed(sortedByViews.slice(0, 5));

                setLatestAlbums(mappedData);
            }
        };
        loadGalleries();
    }, []);

    if (!featuredAlbum) return null; // Or loading spinner

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title="Foto Galeri"
                description="En çarpıcı fotoğraflar, galeriler ve görsel hikayeler Haberfoni Foto Galeri'de."
                url="/foto-galeri"
            />
            {/* Page Header */}
            <div className="bg-black text-white py-4 mb-6">
                <div className="container mx-auto px-4 flex items-center space-x-2">
                    <div className="w-2 h-8 bg-yellow-500"></div>
                    <h1 className="text-2xl font-bold tracking-wider">FOTO GALERİ</h1>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Horizontal Ad Area */}
                <div className="w-full h-[100px] bg-gray-200 flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-300 rounded mb-8">
                    REKLAM ALANI (728x100)
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Featured Album & Latest Grid */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Featured Album */}
                        <Link to={`/foto-galeri/${slugify(featuredAlbum.title)}`} className="block bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer">
                            <div className="relative aspect-video">
                                <img
                                    src={featuredAlbum.thumbnail}
                                    alt={featuredAlbum.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <div className="w-full">
                                        <div className="flex items-center space-x-2 text-yellow-500 mb-2">
                                            <Camera size={24} />
                                            <span className="font-bold text-lg">{featuredAlbum.count} Fotoğraf</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                            {featuredAlbum.title}
                                        </h2>
                                        <div className="flex items-center space-x-4 text-gray-300 text-sm">
                                            <div className="flex items-center space-x-1">
                                                <Clock size={14} />
                                                <span>{featuredAlbum.date}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Eye size={14} />
                                                <span>{featuredAlbum.views} görüntülenme</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Latest Albums Grid with Chunking & Ads */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4 border-b-2 border-gray-200 pb-2">
                                <span className="text-lg font-bold text-gray-800 uppercase">Son Eklenenler</span>
                            </div>

                            {/* Display items in chunks of 20 */}
                            {Array.from({ length: Math.ceil(Math.min(visibleCount, latestAlbums.length) / 20) }).map((_, chunkIndex) => {
                                const chunkStart = chunkIndex * 20;
                                const chunkEnd = Math.min(chunkStart + 20, visibleCount);
                                const chunkItems = latestAlbums.slice(chunkStart, chunkEnd);

                                // Check if this is a new chunk loaded by "Load More" to set ref
                                const newChunkIndex = Math.ceil(prevCount / 20);
                                const isNewChunk = chunkIndex === newChunkIndex;
                                const showHorizontalAd = chunkEnd < visibleCount; // Show ad between loaded chunks if more exist

                                return (
                                    <React.Fragment key={chunkIndex}>
                                        <div
                                            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 scroll-mt-24"
                                            ref={isNewChunk && chunkIndex > 0 ? scrollRef : null}
                                        >
                                            {chunkItems.map((album) => (
                                                <Link key={album.id} to={`/foto-galeri/${slugify(album.title)}`} className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                                                    <div className="relative aspect-[4/3]">
                                                        <img
                                                            src={album.thumbnail}
                                                            alt={album.title}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                                                            <div className="flex items-center space-x-1 text-white text-xs font-bold">
                                                                <ImageIcon size={14} />
                                                                <span>{album.count}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="font-bold text-gray-800 group-hover:text-yellow-600 transition-colors line-clamp-2 h-12 mb-2">
                                                            {album.title}
                                                        </h3>
                                                        <div className="flex items-center justify-between text-gray-500 text-xs">
                                                            <span>{album.date}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Horizontal Ad between chunks */}
                                        {showHorizontalAd && (
                                            <div className="mb-8">
                                                <AdBanner customDimensions="728x90" customMobileDimensions="300x250" customHeight="h-[250px] md:h-[90px]" text="Reklam Alani 728x90" />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                            {/* Load More Button */}
                            {visibleCount < latestAlbums.length && (
                                <div className="mt-8 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 20)}
                                        className="px-8 py-3 bg-white border border-gray-200 text-gray-600 font-medium rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                                    >
                                        Daha Fazla Gör
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar (Most Viewed) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center space-x-2 mb-6 border-b-2 border-yellow-500 pb-2">
                                <span className="text-lg font-bold text-gray-900 uppercase">Çok Bakılanlar</span>
                            </div>
                            <div className="space-y-4">
                                {mostViewed.map((album, index) => (
                                    <Link key={album.id} to={`/foto-galeri/${slugify(album.title)}`} className="flex space-x-3 group cursor-pointer border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded">
                                            <img
                                                src={album.thumbnail}
                                                alt={album.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute top-0 left-0 w-5 h-5 bg-yellow-500 text-white text-xs font-bold flex items-center justify-center rounded-br">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-800 group-hover:text-yellow-600 transition-colors line-clamp-2 mb-1">
                                                {album.title}
                                            </h4>
                                            <div className="flex items-center space-x-1 text-gray-400 text-xs">
                                                <Eye size={10} />
                                                <span>{album.views}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Advertisement Area */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mt-8 sticky top-24">
                            <div className="flex items-center space-x-2 mb-4 border-b-2 border-gray-200 pb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">REKLAM</span>
                            </div>
                            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-300 rounded">
                                REKLAM ALANI (300x400)
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PhotoGalleryPage;
