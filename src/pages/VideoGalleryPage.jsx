import React from 'react';
import { Play, Clock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner'; // Import AdBanner
import { fetchVideos } from '../services/api';
import { mapVideoItem } from '../utils/mappers';
import { slugify } from '../utils/slugify';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import Pagination from '../components/Pagination';

const VideoGalleryPage = () => {
    const [featuredVideo, setFeaturedVideo] = React.useState(null);
    const [mostWatched, setMostWatched] = React.useState([]);
    const [latestVideos, setLatestVideos] = React.useState([]);
    const [currentPage, setCurrentPage] = React.useState(1);
    const PAGE_SIZE = 20;
    const scrollRef = React.useRef(null);

    React.useEffect(() => {
        const loadVideos = async () => {
            const data = await fetchVideos();
            const videoList = Array.isArray(data) ? data : (data.data || []);
            const mappedData = videoList.map(mapVideoItem);

            if (mappedData.length > 0) {
                setFeaturedVideo(mappedData[0]);
                const sortedByViews = [...mappedData].sort((a, b) => (b.views || 0) - (a.views || 0));
                setMostWatched(sortedByViews.slice(0, 5));
                setLatestVideos(mappedData);
            }
        };
        loadVideos();
    }, []);

    // Handle scroll to top on page change
    React.useEffect(() => {
        if (currentPage > 1 && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (currentPage === 1) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    if (!featuredVideo) return null;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const paginatedItems = latestVideos.slice(startIndex, startIndex + PAGE_SIZE);

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title="Video Galeri"
                description="En güncel haber videoları, röportajlar ve özel içerikler Haberfoni Video Galeri'de."
                url="/video-galeri"
            />
            {/* Page Header */}
            <div className="bg-black text-white py-4 mb-6" ref={scrollRef}>
                <div className="container mx-auto px-4 flex items-center space-x-2">
                    <div className="w-2 h-8 bg-red-600"></div>
                    <h1 className="text-2xl font-bold tracking-wider">VİDEO GALERİ</h1>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Horizontal Ad Area */}
                <div className="w-full h-[100px] bg-gray-200 flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-300 rounded mb-8">
                    REKLAM ALANI (728x100)
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Featured Video & Latest Grid */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Featured Video */}
                        {currentPage === 1 && (
                            <Link to={`/video-galeri/${slugify(featuredVideo.title)}`} className="block bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer">
                                <div className="relative aspect-video">
                                    <img
                                        src={getOptimizedImageUrl(featuredVideo.thumbnail)}
                                        alt={featuredVideo.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play size={32} className="text-white ml-1" fill="currentColor" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-3 py-1 rounded font-medium">
                                        {featuredVideo.duration}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                        {featuredVideo.title}
                                    </h2>
                                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                                        <div className="flex items-center space-x-1">
                                            <Clock size={14} />
                                            <span>{featuredVideo.date}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Eye size={14} />
                                            <span>{featuredVideo.views} izlenme</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Latest Videos Grid */}
                        <div>
                            <div className="flex items-center space-x-2 mb-4 border-b-2 border-gray-200 pb-2">
                                <span className="text-lg font-bold text-gray-800 uppercase">Son Eklenenler</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                {paginatedItems.map((video, index) => (
                                    <Link key={video.id} to={`/video-galeri/${slugify(video.title)}`} className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer hover:shadow-md transition-shadow relative">
                                        <div className="absolute top-2 left-2 w-8 h-8 bg-black/70 text-white font-bold flex items-center justify-center rounded-full z-10 text-sm">
                                            {startIndex + index + 1}
                                        </div>
                                        <div className="relative aspect-video">
                                            <img
                                                src={getOptimizedImageUrl(video.thumbnail)}
                                                alt={video.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Play size={20} className="text-red-600 ml-1" fill="currentColor" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                                {video.duration}
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 h-12 mb-2">
                                                {video.title}
                                            </h3>
                                            <div className="flex items-center justify-between text-gray-500 text-xs">
                                                <span>{video.date}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            <Pagination
                                currentPage={currentPage}
                                totalCount={latestVideos.length}
                                pageSize={PAGE_SIZE}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </div>

                    {/* Right Column: Sidebar (Most Watched) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                            <div className="flex items-center space-x-2 mb-6 border-b-2 border-red-600 pb-2">
                                <span className="text-lg font-bold text-gray-900 uppercase">Çok İzlenenler</span>
                            </div>
                            <div className="space-y-4">
                                {mostWatched.map((video, index) => (
                                    <Link key={video.id} to={`/video-galeri/${slugify(video.title)}`} className="flex space-x-3 group cursor-pointer border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded">
                                            <img
                                                src={getOptimizedImageUrl(video.thumbnail)}
                                                alt={video.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute top-0 left-0 w-5 h-5 bg-red-600 text-white text-xs font-bold flex items-center justify-center rounded-br">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
                                                {video.title}
                                            </h4>
                                            <div className="flex items-center space-x-1 text-gray-400 text-xs">
                                                <Eye size={10} />
                                                <span>{video.views}</span>
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

export default VideoGalleryPage;
