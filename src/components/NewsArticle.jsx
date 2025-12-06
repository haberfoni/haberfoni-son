import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, Share2 } from 'lucide-react';
import AdBanner from './AdBanner';
import CommentSection from './CommentSection';
import { getEmbedUrl } from '../utils/videoUtils';
import ImageWithFallback from './ImageWithFallback';

const NewsArticle = ({ news, onVisible }) => {
    const articleRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    onVisible && onVisible(news);
                }
            },
            { threshold: 0, rootMargin: '0px 0px -50% 0px' } // Trigger when element enters top half of viewport
        );

        if (articleRef.current) {
            observer.observe(articleRef.current);
        }

        return () => {
            if (articleRef.current) {
                observer.unobserve(articleRef.current);
            }
        };
    }, [news, onVisible]);

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: news.title,
                    text: news.title,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link kopyalandı!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <div ref={articleRef} className="mb-20 border-b border-gray-200 pb-12 last:border-0" id={`article-${news.id}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {news.title}
            </h1>

            {news.summary && (
                <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 leading-snug">
                    {news.summary}
                </h2>
            )}

            <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
                <div className="flex items-center space-x-6 text-gray-500">
                    <div className="flex items-center">
                        <Clock size={18} className="mr-2" />
                        {news.time}
                    </div>
                    <div className="flex items-center">
                        <Eye size={18} className="mr-2" />
                        {news.views?.toLocaleString() || 0} görüntülenme
                    </div>
                </div>
                <button
                    onClick={handleShare}
                    className="flex items-center text-gray-500 hover:text-primary transition-colors"
                >
                    <Share2 size={20} className="mr-2" />
                    Paylaş
                </button>
            </div>

            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
                {/* 
                    Media Logic:
                    1. If media_type is 'video', show Video.
                    2. If media_type is missing/null (migration not run) BUT video_url exists, show Video (Fallback).
                    3. Otherwise show Image.
                */}
                {/* 
                    Media Logic:
                    Priority: Video > Image
                    If a video link exists, it takes precedence as the header media.
                    The image remains available for list/card views (thumbnail).
                */}
                {news.video_url ? (
                    <div className="relative pt-[56.25%] bg-black">
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={getEmbedUrl(news.video_url)}
                            title={news.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <ImageWithFallback
                        src={news.image}
                        alt={news.title}
                        className="w-full max-h-[500px] object-cover"
                    />
                )}
            </div>

            <div className="prose prose-lg max-w-none text-gray-800">
                <div dangerouslySetInnerHTML={{
                    __html: news.content || `
                        <p class="lead text-xl text-gray-600 mb-6 font-medium">
                            ${news.title} hakkında detaylı bilgiler ve son gelişmeler.
                        </p>
                        <p>İçerik hazırlanıyor...</p>
                    `
                }} />

                {/* Ad Banner - Placed at the bottom as requested */}
                <div className="mt-12 mb-8 flex justify-center">
                    <AdBanner
                        placementCode="news_content_1"
                        customDimensions="300x250"
                        customHeight="h-[250px]"
                        text="Haber Sonu Reklam"
                    />
                </div>
            </div>

            {/* Comment Section */}
            <CommentSection comments={news.comments} />
        </div>
    );
};

export default NewsArticle;
