import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Share2, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { slugify } from '../utils/slugify';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const PhotoArticle = ({ album, images, relatedAlbums, onVisible }) => {
    const articleRef = useRef(null);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Reset index when album changes (important for infinite scroll reuse)
    useEffect(() => {
        setCurrentIndex(0);
    }, [album.id]);

    // Visibility Observer for View Tracking and URL Update
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry.isIntersecting) {
                    onVisible(album);
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
    }, [album, onVisible]);

    const handleShare = async () => {
        const photoUrl = `${window.location.origin}/foto-galeri/${slugify(album.title)}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: album.title,
                    text: album.title,
                    url: photoUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(photoUrl);
            alert('Link kopyalandı!');
        }
    };

    return (
        <article ref={articleRef} className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
            <div className="p-6 pb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    <Link to={`/foto-galeri/${slugify(album.title)}`} className="hover:text-yellow-600 transition-colors">
                        {album.title}
                    </Link>
                </h1>

                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="flex items-center space-x-4 text-gray-500 text-sm flex-wrap gap-y-2">
                        {album.source && (
                            <div className="flex items-center space-x-1">
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded border border-yellow-200 uppercase">
                                    {album.source}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center space-x-1 text-primary">
                            <Camera size={16} />
                            <span className="font-bold">{images.length} Fotoğraf</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{album.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Eye size={16} />
                            <span>{album.views || 0} görüntüleme</span>
                        </div>
                    </div>
                    <button
                        onClick={handleShare}
                        className="flex items-center space-x-1 text-gray-500 hover:text-yellow-600 transition-colors ml-4"
                    >
                        <Share2 size={18} />
                        <span className="hidden sm:inline">Paylaş</span>
                    </button>
                </div>
            </div>

            {/* Gallery Images - Paginated */}
            <div className="p-6">
                {images && images.length > 0 ? (
                    <div className="space-y-6">
                        <div className="relative rounded-lg overflow-hidden shadow-md bg-black min-h-[400px] md:min-h-[500px] flex items-center justify-center group/img">
                            {images[currentIndex].media_type === 'video' ? (
                                <div className="w-full aspect-video">
                                    {images[currentIndex].video_url?.includes('m3u8') || images[currentIndex].video_url?.includes('.mp4') ? (
                                        <video 
                                            src={images[currentIndex].video_url} 
                                            controls 
                                            poster={getOptimizedImageUrl(images[currentIndex].image_url)}
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <iframe 
                                            src={images[currentIndex].video_url} 
                                            className="w-full h-full" 
                                            allowFullScreen
                                            title={images[currentIndex].caption || album.title}
                                        />
                                    )}
                                </div>
                            ) : (
                                <img
                                    src={getOptimizedImageUrl(images[currentIndex].image_url)}
                                    alt={`${album.title} - ${currentIndex + 1}`}
                                    className="w-full h-auto max-h-[80vh] object-contain"
                                />
                            )}
                            
                            {/* Navigation Overlays */}
                            {currentIndex > 0 && (
                                <button 
                                    onClick={() => setCurrentIndex(prev => prev - 1)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/80"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}
                            {currentIndex < images.length - 1 && (
                                <button 
                                    onClick={() => setCurrentIndex(prev => prev + 1)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-black/80"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            )}

                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20">
                                {currentIndex + 1} / {images.length}
                                {images[currentIndex].media_type === 'video' && <span className="ml-2 text-yellow-400 font-extrabold">VIDEO</span>}
                            </div>
                        </div>

                        {/* Caption */}
                        {images[currentIndex].caption && images[currentIndex].caption.trim() && (
                            <div className="bg-gray-50 border-l-4 border-yellow-500 p-4 rounded-r shadow-sm">
                                <p className="text-gray-800 text-lg leading-relaxed">
                                    {images[currentIndex].caption}
                                </p>
                            </div>
                        )}

                        {/* Internal Navigation Buttons */}
                        <div className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-2">
                                <button
                                    disabled={currentIndex === 0}
                                    onClick={() => {
                                        setCurrentIndex(prev => prev - 1);
                                        articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                                >
                                    <ChevronLeft size={20} />
                                    <span>Önceki</span>
                                </button>
                                <button
                                    disabled={currentIndex === images.length - 1}
                                    onClick={() => {
                                        setCurrentIndex(prev => prev + 1);
                                        articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="px-6 py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 disabled:opacity-30 disabled:cursor-not-allowed shadow-md transition-all flex items-center space-x-2"
                                >
                                    <span>Sonraki</span>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            
                            {/* Mini Dot/Number indicator */}
                            <div className="flex flex-wrap justify-center gap-1">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setCurrentIndex(idx);
                                            articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }}
                                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-all ${
                                            currentIndex === idx 
                                            ? 'bg-yellow-500 text-white ring-2 ring-yellow-200' 
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center text-gray-400">Görsel bulunamadı.</div>
                )}
            </div>

            {/* Inline Related Albums for Mobile if needed */}
            {relatedAlbums && relatedAlbums.length > 0 && (
                <div className="p-6 bg-gray-50 border-t border-gray-100 mt-4 rounded-b-lg lg:hidden">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-yellow-500 pb-2 uppercase inline-block">
                        İlgili Galeriler
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {relatedAlbums.map((item) => (
                            <Link
                                key={item.id}
                                to={`/foto-galeri/${slugify(item.title)}`}
                                className="flex space-x-3 group"
                            >
                                <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded">
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-yellow-500 text-white text-[10px] px-1 font-bold">
                                        {item.count}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-800 group-hover:text-yellow-600 transition-colors line-clamp-2 mb-1">
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

export default PhotoArticle;
