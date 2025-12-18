import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, Share2, Camera, Image as ImageIcon } from 'lucide-react';
import { fetchPhotoGalleries, fetchGalleryImages, incrementPhotoGalleryView } from '../services/api';
import { mapPhotoGalleryItem } from '../utils/mappers';
import SEO from '../components/SEO';
import { slugify } from '../utils/slugify';

import ShareModal from '../components/common/ShareModal';

const PhotoDetailPage = () => {
    const { slug, id } = useParams();

    const [album, setAlbum] = React.useState(null);
    const [images, setImages] = React.useState([]);
    const [relatedAlbums, setRelatedAlbums] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showShareModal, setShowShareModal] = React.useState(false);
    const countedSlugRef = React.useRef(null);

    React.useEffect(() => {
        // ... (existing useEffect logic unchanged) 
        const loadAlbum = async () => {
            setLoading(true);
            try {
                let currentAlbum = null;
                let galleryImages = [];

                // 1. Try to fetch by ID (Efficient & Reliable)
                if (id) {
                    const detail = await import('../services/api').then(m => m.fetchPhotoGalleryDetail(id));
                    if (detail) {
                        currentAlbum = mapPhotoGalleryItem(detail);
                        // Fetch images directly if not included (though fetchPhotoGalleryDetail usually includes them)
                        // If detail includes images (gallery_images), map them
                        if (detail.gallery_images) {
                            galleryImages = detail.gallery_images;
                        } else {
                            galleryImages = await fetchGalleryImages(id);
                        }
                    }
                }

                // 2. Fallback: Fetch all if ID missing or failed (Legacy Slug support)
                if (!currentAlbum) {
                    const galleries = await fetchPhotoGalleries();
                    const mappedGalleries = galleries.map(mapPhotoGalleryItem);
                    currentAlbum = mappedGalleries.find(item => slugify(item.title) === slug);

                    if (currentAlbum) {
                        galleryImages = await fetchGalleryImages(currentAlbum.id);
                    }
                }

                setAlbum(currentAlbum);

                if (currentAlbum) {
                    // Increment view count
                    if (countedSlugRef.current !== (id || slug)) {
                        countedSlugRef.current = (id || slug);
                        incrementPhotoGalleryView(currentAlbum.id).catch(console.error);
                    }

                    setImages(galleryImages.map(img => ({
                        image_url: img.image_url,
                        caption: img.caption
                    })));

                    // Load related (need to fetch list if not already fetched)
                    // Optimization: We can just fetch 5 latest galleries for related
                    const related = await fetchPhotoGalleries();
                    setRelatedAlbums(related.map(mapPhotoGalleryItem)
                        .filter(item => item.id !== currentAlbum.id)
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 5));
                }
            } catch (err) {
                console.error("Error loading photo gallery:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAlbum();
    }, [slug, id]);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: album.title,
                    text: album.title,
                    url: window.location.href,
                });
            } else {
                setShowShareModal(true);
            }
        } catch (err) {
            console.log('Error sharing:', err);
            if (err.name !== 'AbortError') {
                setShowShareModal(true);
            }
        }
    };

    if (loading) return <div className="text-center py-20">Yükleniyor...</div>;

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

    return (
        <div className="bg-gray-100 min-h-screen pb-12">
            <SEO
                title={album.seo_title || album.title}
                description={album.seo_description || `${album.title} fotoğraf galerisi.`}
                url={`/foto-galeri/${slug}`}
                image={album.thumbnail}
                type="article"
                publishedTime={album.published_at}
                modifiedTime={album.created_at}
                tags={album.seo_keywords ? album.seo_keywords.split(',') : ['Foto', 'Galeri', 'Haber']}
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
                                    <button
                                        onClick={handleShare}
                                        className="flex items-center space-x-1 text-gray-500 hover:text-primary transition-colors"
                                    >
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
                                                src={img.image_url}
                                                alt={`${album.title} - ${index + 1}`}
                                                className="w-full h-auto"
                                                loading="lazy"
                                            />
                                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                {index + 1} / {images.length}
                                            </div>
                                        </div>
                                        {img.caption ? (
                                            <p className="text-gray-700 text-sm mt-2 px-1">
                                                {img.caption}
                                            </p>
                                        ) : (
                                            <p className="text-gray-400 text-xs italic mt-1 px-1">
                                                * Açıklama yok
                                            </p>
                                        )}
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
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title={album.title}
                url={window.location.href}
            />
        </div>
    );
};

export default PhotoDetailPage;
