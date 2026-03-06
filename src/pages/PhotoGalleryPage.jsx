import React from 'react';
import { Camera, Clock, Eye, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner'; // Import AdBanner
import { fetchPhotoGalleries, fetchVideos } from '../services/api';
import { mapPhotoGalleryItem, mapVideoItem } from '../utils/mappers';
import { slugify } from '../utils/slugify';
import Pagination from '../components/Pagination';
import { Play } from 'lucide-react';

const PhotoGalleryPage = () => {
    const [featuredItem, setFeaturedItem] = React.useState(null);
    const [mostViewed, setMostViewed] = React.useState([]);
    const [allGalleryItems, setAllGalleryItems] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalCount, setTotalCount] = React.useState(0);
    const PAGE_SIZE = 20;
    const scrollRef = React.useRef(null);

    React.useEffect(() => {
        const loadGalleries = async () => {
            const [photoRes, videoRes] = await Promise.all([
                fetchPhotoGalleries(currentPage, PAGE_SIZE),
                fetchVideos(currentPage, PAGE_SIZE)
            ]);
            
            const photoList = (photoRes.data || [])
                .map(item => ({ ...mapPhotoGalleryItem(item), type: 'photo' }));
            
            const videoList = (videoRes.data || [])
                .map(item => ({ ...mapVideoItem(item), type: 'video' }));

            const mergedData = [...photoList, ...videoList].sort((a, b) => {
                const dateA = new Date(a.created_at || a.date);
                const dateB = new Date(b.created_at || b.date);
                return dateB - dateA;
            });

            if (photoRes.data || videoRes.data) {
                if (currentPage === 1 && mergedData.length > 0) {
                    setFeaturedItem(mergedData[0]);
                }
                
                const sortedByViews = [...mergedData].sort((a, b) => (b.views || 0) - (a.views || 0));
                setMostViewed(sortedByViews.slice(0, 5));
                
                setAllGalleryItems(mergedData);
                // Total count should be the sum of both pools to allow full pagination of mixed content
                // According to api.js, these are returned as top-level 'total' properties in the response object
                const totalPhotos = photoRes.total || 0;
                const totalVideos = videoRes.total || 0;
                setTotalCount(totalPhotos + totalVideos);
            }
        };
        loadGalleries();
    }, [currentPage]);

    // Handle jump to top on page change
    React.useEffect(() => {
        if (currentPage > 1 && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (currentPage === 1 && allGalleryItems.length > 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    if (!featuredItem && allGalleryItems.length === 0) return null;

    const paginatedItems = allGalleryItems; // Already paginated from API

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title="Foto Galeri"
                description="En çarpıcı fotoğraflar, galeriler ve görsel hikayeler Haberfoni Foto Galeri'de."
                url="/foto-galeri"
            />
            {/* Page Header */}
            <div className="bg-black text-white py-4 mb-6" ref={scrollRef}>
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
                    {/* Left Column: Featured Item & Latest Grid */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Featured Item */}
                        {currentPage === 1 && (
                            <Link 
                                to={featuredItem.type === 'video' ? `/video-galeri/${slugify(featuredItem.title)}` : `/foto-galeri/${slugify(featuredItem.title)}`} 
                                className="block bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer"
                            >
                                <div className="relative aspect-video">
                                    <img
                                        src={featuredItem.thumbnail}
                                        alt={featuredItem.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                        <div className="w-full">
                                            {featuredItem.type === 'video' ? (
                                                <div className="flex items-center space-x-2 text-red-500 mb-2">
                                                    <Play size={24} fill="currentColor" />
                                                    <span className="font-bold text-lg">Video</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2 text-yellow-500 mb-2">
                                                    <Camera size={24} />
                                                    <span className="font-bold text-lg">{featuredItem.count} Fotoğraf</span>
                                                </div>
                                            )}
                                            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                                                {featuredItem.title}
                                            </h2>
                                            <div className="flex items-center space-x-4 text-gray-300 text-sm">
                                                <div className="flex items-center space-x-1">
                                                    <Clock size={14} />
                                                    <span>{featuredItem.date}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Eye size={14} />
                                                    <span>{featuredItem.views} görüntülenme</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {featuredItem.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <Play size={32} className="text-white ml-1" fill="currentColor" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )}

                        {/* Latest Items Grid */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4 border-b-2 border-gray-200 pb-2">
                                <span className="text-lg font-bold text-gray-800 uppercase">Son Eklenenler</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                {paginatedItems.map((item) => (
                                    <Link 
                                        key={`${item.type}-${item.id}`} 
                                        to={item.type === 'video' ? `/video-galeri/${slugify(item.title)}` : `/foto-galeri/${slugify(item.title)}`} 
                                        className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                                    >
                                        <div className="relative aspect-[4/3]">
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                                                <div className="flex items-center space-x-1 text-white text-xs font-bold">
                                                    {item.type === 'video' ? <Play size={14} fill="currentColor" /> : <ImageIcon size={14} />}
                                                    <span>{item.type === 'video' ? 'Video' : item.count}</span>
                                                </div>
                                            </div>
                                            {item.type === 'video' && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                                        <Play size={16} fill="currentColor" className="ml-0.5" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-800 group-hover:text-yellow-600 transition-colors line-clamp-2 h-12 mb-2">
                                                {item.title}
                                            </h3>
                                            <div className="flex items-center justify-between text-gray-500 text-xs">
                                                <span>{item.date}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalCount={totalCount}
                                pageSize={PAGE_SIZE}
                                onPageChange={setCurrentPage}
                            />
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
