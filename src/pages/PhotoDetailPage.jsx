import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, Share2, Camera, Image as ImageIcon } from 'lucide-react';
import { photoGalleryItems } from '../data/mockData';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';

const PhotoDetailPage = () => {
    const { slug } = useParams();

    // Find album by slug
    const album = photoGalleryItems.find(item => slugify(item.title) === slug);

    // Filter related albums (exclude current)
    const relatedAlbums = photoGalleryItems
        .filter(item => item.id !== album?.id)
        .slice(0, 5);

    if (!album) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Albüm Bulunamadı</h1>
                <Link to="/foto-galeri" className="text-primary hover:underline">
                    Fotoğraf Galerisine Dön
                </Link>
            </div>
        );
    }

    // Mock images if not present
    const images = album.images || Array(5).fill(album.thumbnail);

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title={album.title}
                description={`${album.title} fotoğraf galerisi. Haberfoni Foto Galeri.`}
                url={`/foto-galeri/${slug}`}
                image={album.thumbnail}
                type="article"
            />

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-primary">Ana Sayfa</Link>
                    <span>/</span>
                    <Link to="/foto-galeri" className="hover:text-primary">Foto Galeri</Link>
                    <span>/</span>
                    <span className="text-gray-900 truncate max-w-md">{album.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                            <div className="p-6 border-b border-gray-100">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                    {album.title}
                                </h1>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-gray-500 text-sm">
                                        <div className="flex items-center space-x-1">
                                            <Clock size={16} />
                                            <span>{album.date}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Eye size={16} />
                                            <span>{album.views} görüntülenme</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Camera size={16} />
                                            <span>{album.count} Fotoğraf</span>
                                        </div>
                                    </div>
                                    <button className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors">
                                        <Share2 size={18} />
                                        <span className="hidden sm:inline">Paylaş</span>
                                    </button>
                                </div>
                            </div>

                            {/* Gallery Images */}
                            <div className="p-6 space-y-8">
                                {images.map((img, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="relative rounded-lg overflow-hidden shadow-sm">
                                            <img
                                                src={img}
                                                alt={`${album.title} - ${index + 1}`}
                                                className="w-full h-auto"
                                                loading="lazy"
                                            />
                                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                {index + 1} / {images.length}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm italic">
                                            {album.title} galerisinden {index + 1}. fotoğraf
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Related Albums */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-yellow-500 pb-2 uppercase">
                                İlgili Galeriler
                            </h3>
                            <div className="space-y-4">
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

export default PhotoDetailPage;
