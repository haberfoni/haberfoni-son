import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, Share2, Play, Calendar } from 'lucide-react';
import { fetchVideos } from '../services/api';
import { mapVideoItem } from '../utils/mappers';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';

const VideoDetailPage = () => {
    const { slug } = useParams();

    const [video, setVideo] = React.useState(null);
    const [relatedVideos, setRelatedVideos] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    const viewCountedRef = React.useRef(false);

    React.useEffect(() => {
        viewCountedRef.current = false; // Reset for new slug

        const loadVideo = async () => {
            setLoading(true);
            const videos = await fetchVideos();
            const mappedVideos = videos.map(mapVideoItem);

            const currentVideo = mappedVideos.find(item => slugify(item.title) === slug);
            setVideo(currentVideo);

            if (currentVideo) {
                // Increment view count
                if (!viewCountedRef.current) {
                    viewCountedRef.current = true;
                    try {
                        const { adminService } = await import('../services/adminService');
                        await adminService.incrementVideoViews(currentVideo.id);
                    } catch (err) {
                        console.error("View increment failed", err);
                    }
                }

                setRelatedVideos(mappedVideos
                    .filter(item => item.id !== currentVideo.id)
                    .sort(() => 0.5 - Math.random()) // Randomize for "Recommended" feel
                    .slice(0, 5));
            }
            setLoading(false);
        };
        loadVideo();
    }, [slug]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video.title,
                    text: video.title,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link kopyalandı!');
        }
    };

    if (loading) return <div className="text-center py-20">Yükleniyor...</div>;

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
                            {/* Video Player */}
                            {/* Video Player */}
                            <div className="aspect-video bg-black relative">
                                {(() => {
                                    // Helper function from utils/videoUtils would be better, but importing directly here mainly
                                    // Check if it's a YouTube video
                                    const youtubeId = (video.videoUrl && (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be')))
                                        ? (() => {
                                            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                                            const match = video.videoUrl.match(regExp);
                                            return (match && match[7].length === 11) ? match[7] : null;
                                        })()
                                        : null;

                                    if (youtubeId) {
                                        return (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        );
                                    } else {
                                        return (
                                            <video
                                                controls
                                                width="100%"
                                                height="100%"
                                                className="w-full h-full"
                                                src={video.videoUrl}
                                            >
                                                Tarayıcınız video etiketini desteklemiyor.
                                            </video>
                                        );
                                    }
                                })()}
                            </div>

                            <div className="p-6">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                    {video.title}
                                </h1>

                                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                                        <div className="flex items-center space-x-1">
                                            <Calendar size={16} />
                                            <span>{video.date}</span>
                                        </div>
                                        {video.duration && (
                                            <div className="flex items-center space-x-1">
                                                <Clock size={16} />
                                                <span>{video.duration}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-1">
                                            <Eye size={16} />
                                            <span>{video.views} izlenme</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors"
                                    >
                                        <Share2 size={18} />
                                        <span className="hidden sm:inline">Paylaş</span>
                                    </button>
                                </div>

                                <div className="prose max-w-none text-gray-700">
                                    {video.description ? (
                                        <div dangerouslySetInnerHTML={{ __html: video.description }} />
                                    ) : (
                                        <p align="justify">Bu video için henüz bir açıklama girilmemiştir.</p>
                                    )}
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
                                                <div className="flex items-center space-x-1">
                                                    <Eye size={12} />
                                                    <span>{item.views}</span>
                                                </div>
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
