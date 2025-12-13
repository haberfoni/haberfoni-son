import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Camera, ArrowRight } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import AdBanner from './AdBanner';
import { slugify } from '../utils/slugify';

const MultimediaRow = ({ videos = [], photos = [] }) => {
    if (!videos.length && !photos.length) return null;

    return (
        <>
            <section className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Video Gallery Section */}
                    {videos.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                    <span className="bg-red-600 text-white p-1.5 rounded-lg">
                                        <Play size={18} fill="currentColor" />
                                    </span>
                                    Video Galeri
                                </h2>
                                <Link to="/video-galeri" className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                                    Tümünü Gör
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {videos.map((video) => (
                                    <Link
                                        key={video.id}
                                        to={`/video-galeri/${slugify(video.title)}/${video.id}`}
                                        className="group block relative rounded-lg overflow-hidden aspect-video bg-gray-100"
                                    >
                                        <ImageWithFallback
                                            src={video.image_url || video.thumbnail_url || video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            width="320"
                                            height="180"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                                        {/* Play Icon Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-red-600 shadow-lg transform group-hover:scale-110 transition-transform">
                                                <Play size={16} fill="currentColor" className="ml-0.5" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                            <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-sm">
                                                {video.title}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Photo Gallery Section */}
                    {photos.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                    <span className="bg-yellow-500 text-white p-1.5 rounded-lg">
                                        <Camera size={18} />
                                    </span>
                                    Foto Galeri
                                </h2>
                                <Link to="/foto-galeri" className="text-sm font-medium text-gray-500 hover:text-yellow-600 flex items-center gap-1 transition-colors">
                                    Tümünü Gör
                                    <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {photos.map((photo) => (
                                    <Link
                                        key={photo.id}
                                        to={`/foto-galeri/${slugify(photo.title)}/${photo.id}`}
                                        className="group block relative rounded-lg overflow-hidden aspect-[4/3] bg-gray-100"
                                    >
                                        <ImageWithFallback
                                            src={photo.image_url}
                                            alt={photo.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            width="320"
                                            height="240"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                                        {/* Camera Icon Overlay */}
                                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                            <Camera size={12} />
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                            <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-sm">
                                                {photo.title}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {/* Ad Banner Below Multimedia */}
            <div className="container mx-auto px-4">
                <AdBanner placementCode="home_multimedia_bottom" customDimensions="970x250" customMobileDimensions="300x250" customHeight="h-[250px]" />
            </div>
        </>
    );
};

export default MultimediaRow;
