import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, Share2, Play } from 'lucide-react';
import { videoGalleryItems } from '../data/mockData';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';

const VideoDetailPage = () => {
    const { slug } = useParams();

    // Find video by slug
    const video = videoGalleryItems.find(item => slugify(item.title) === slug);

    // Filter related videos (exclude current)
    const relatedVideos = videoGalleryItems
        .filter(item => item.id !== video?.id)
        .slice(0, 5);

    if (!video) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Video Bulunamadı</h1>
                <Link to="/video-galeri" className="text-primary hover:underline">
                    Video Galerisine Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title={video.title}
                description={`${video.title} videosunu izle. Haberfoni Video Galeri.`}
                url={`/video-galeri/${slug}`}
                image={video.thumbnail}
                type="video.other"
            />

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary">Ana Sayfa</Link>
                    <span>/</span>
                    <Link to="/video-galeri" className="hover:text-primary">Video Galeri</Link>
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-md">{video.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                            {/* Video Player Placeholder */}
                            <div className="aspect-video bg-black relative">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={video.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>

                            <div className="p-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                    {video.title}
                                </h1>

                                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                                        <div className="flex items-center space-x-1">
                                            <Clock size={16} />
                                            <span>{video.date}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Eye size={16} />
                                            <span>{video.views} izlenme</span>
                                        </div>
                                    </div>
                                    <button className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                                        <Share2 size={18} />
                                        <span className="hidden sm:inline">Paylaş</span>
                                    </button>
                                </div>

                                <div className="prose max-w-none text-gray-700">
                                    <p>
                                        Bu video hakkında detaylı açıklama metni burada yer alacak.
                                        Video içeriği, konuşmacılar ve konuyla ilgili özet bilgiler.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Related Videos */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-red-600 pb-2 uppercase">
                                İlgili Videolar
                            </h3>
                            <div className="space-y-4">
                                {relatedVideos.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/video-galeri/${slugify(item.title)}`}
                                        className="flex space-x-3 group"
                                    >
                                        <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded">
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10">
                                                <Play size={16} className="text-white" fill="currentColor" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                <span>{item.date}</span>
                                                <span>•</span>
                                                <span>{item.views}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoDetailPage;
