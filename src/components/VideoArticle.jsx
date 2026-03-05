import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Share2, Play, Calendar } from 'lucide-react';
import { slugify } from '../utils/slugify';
import { isDirectVideo, getEmbedUrl } from '../utils/videoUtils';

const VideoArticle = ({ video, relatedVideos, onVisible }) => {
    const articleRef = useRef(null);

    // Visibility Observer for View Tracking and URL Update
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    onVisible(video);
                }
            },
            {
                threshold: 0.5,
                rootMargin: '-10% 0px -10% 0px'
            }
        );

        if (articleRef.current) {
            observer.observe(articleRef.current);
        }

        return () => {
            if (articleRef.current) {
                observer.unobserve(articleRef.current);
            }
        };
    }, [video, onVisible]);

    const handleShare = async () => {
        const videoUrl = `${window.location.origin}/video-galeri/${slugify(video.title)}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video.title,
                    text: video.title,
                    url: videoUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(videoUrl);
            alert('Link kopyalandı!');
        }
    };

    return (
        <article ref={articleRef} className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
            {/* Video Player wrapper logic identical to previous implementation */}
            <>
                {(() => {
                    if (isDirectVideo(video.videoUrl)) {
                        return (
                            <div className="w-full bg-black flex justify-center items-center overflow-hidden" style={{ maxHeight: '70vh' }}>
                                <video
                                    controls
                                    className="w-full max-h-[70vh] object-contain"
                                    src={video.videoUrl}
                                >
                                    Tarayıcınız video etiketini desteklemiyor.
                                </video>
                            </div>
                        );
                    } else {
                        return (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm bg-black">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={getEmbedUrl(video.videoUrl) || video.videoUrl}
                                    title={video.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        );
                    }
                })()}
            </>

            <div className="p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    <Link to={`/video-galeri/${slugify(video.title)}`} className="hover:text-primary transition-colors">
                        {video.title}
                    </Link>
                </h1>

                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-center space-x-4 text-gray-500 text-sm flex-wrap gap-y-2">
                        {video.source && (
                            <div className="flex items-center space-x-1">
                                <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded border border-red-200 uppercase">
                                    {video.source}
                                </span>
                            </div>
                        )}
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
                            <span>{video.views || 0} izlenme</span>
                        </div>
                        {video.author && (
                            <div className="flex items-center space-x-1 text-primary font-medium">
                                <span>Habere Katkıda Bulunan: {video.author}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleShare}
                        className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors ml-4"
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

            {/* Related Videos moved to bottom of article for mobile viewing, or as part of article body if layout permits. 
                In this multi-article layout, we keep it inline or rely on a shared sidebar. Let's put a small inline "İlgili Videolar" section at the end if provided. */}
            {relatedVideos && relatedVideos.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 mt-4 rounded-b-lg lg:hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-red-600 pb-2 uppercase inline-block">
                        İlgili Videolar
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
};

export default VideoArticle;
