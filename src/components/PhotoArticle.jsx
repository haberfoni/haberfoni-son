import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Share2, Camera } from 'lucide-react';
import { slugify } from '../utils/slugify';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const PhotoArticle = ({ album, images, relatedAlbums, onVisible }) => {
    const articleRef = useRef(null);

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
                threshold: 0.2, // Trigger when 20% of gallery header is visible
                rootMargin: '-5% 0px -5% 0px'
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
        const albumUrl = `${window.location.origin}/foto-galeri/${slugify(album.title)}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: album.title,
                    text: album.title,
                    url: albumUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(albumUrl);
            alert('Link kopyalandı!');
        }
    };

    return (
        <article ref={articleRef} className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
            <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    <Link to={`/foto-galeri/${slugify(album.title)}`} className="hover:text-primary transition-colors">
                        {album.title}
                    </Link>
                </h1>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-gray-500 text-sm flex-wrap gap-y-2">
                        {album.source && (
                            <div className="flex items-center space-x-1">
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded border border-yellow-200 uppercase">
                                    {album.source}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{album.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Eye size={16} />
                            <span>{album.views || 0} görüntülenme</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Camera size={16} />
                            <span>{album.count || images?.length || 0} Fotoğraf</span>
                        </div>
                        {album.author && (
                            <div className="flex items-center space-x-1 text-primary font-medium">
                                <span>Habere Katkıda Bulunan: {album.author}</span>
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

                {album.description && (
                    <div className="mt-8 text-gray-800 leading-relaxed text-lg border-l-4 border-yellow-500 pl-4 bg-gray-50 py-4 rounded-r">
                        <div dangerouslySetInnerHTML={{ __html: album.description }} />
                    </div>
                )}
            </div>

            {/* Gallery Images */}
            <div className="p-6 space-y-8">
                {images && images.map((img, index) => (
                    <div key={index} className="space-y-2">
                        <div className="relative rounded-lg overflow-hidden shadow-sm bg-black min-h-[300px] flex items-center justify-center">
                            {img.media_type === 'video' ? (
                                <div className="w-full aspect-video">
                                    {img.video_url?.includes('m3u8') || img.video_url?.includes('.mp4') ? (
                                        <video 
                                            src={img.video_url} 
                                            controls 
                                            poster={getOptimizedImageUrl(img.image_url)}
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <iframe 
                                            src={img.video_url} 
                                            className="w-full h-full" 
                                            allowFullScreen
                                            title={img.caption || album.title}
                                        />
                                    )}
                                </div>
                            ) : (
                                <img
                                    src={getOptimizedImageUrl(img.image_url)}
                                    alt={`${album.title} - ${index + 1}`}
                                    className="w-full h-auto"
                                    loading="lazy"
                                />
                            )}
                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold shadow">
                                {index + 1} / {images.length}
                                {img.media_type === 'video' && <span className="ml-2 text-yellow-400 font-extrabold">VIDEO</span>}
                            </div>
                        </div>
                        {img.caption && img.caption.trim() && (
                            <p className="text-gray-700 text-sm mt-2 px-1 italic border-l-2 border-yellow-400 pl-3 bg-gray-50 py-1 rounded-r">
                                {img.caption}
                            </p>
                        )}
                    </div>
                ))}
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
