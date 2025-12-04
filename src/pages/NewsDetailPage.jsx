import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Eye, ArrowLeft, Share2 } from 'lucide-react';
import { newsItems, sliderItems } from '../data/mockData';
import NewsCard from '../components/NewsCard';
import AdBanner from '../components/AdBanner';
import SEO from '../components/SEO';
import CommentSection from '../components/CommentSection';

import { slugify } from '../utils/slugify';

const NewsDetailPage = () => {
    const { slug } = useParams();

    // Combine all news items to find the current one
    const allNews = [...sliderItems, ...newsItems];
    const news = allNews.find(item => slugify(item.title) === slug);

    // Scroll to top when slug changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    if (!news) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Haber Bulunamadı</h2>
                <Link to="/" className="text-primary hover:underline">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    // Filter related news (same category, excluding current item)
    const relatedNews = allNews
        .filter(item => item.category === news.category && item.id !== news.id)
        .slice(0, 3);

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
        <>
            <SEO
                title={news.title}
                description={news.summary}
                image={news.image}
                url={`/kategori/${slugify(news.category)}/${slug}`}
                type="article"
                publishedTime={new Date().toISOString()} // In a real app, use actual date from news.time if available as date object
                author="Haberfoni Editörü"
                tags={[news.category, 'Haber', 'Gündem']}
            />
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb & Back */}
                <div className="flex items-center justify-between mb-6">
                    <Link to="/" className="flex items-center text-gray-500 hover:text-primary transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Ana Sayfa
                    </Link>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Link to={`/kategori/${slugify(news.category)}`} className="hover:text-primary">
                            {news.category}
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 truncate max-w-[200px]">{news.title}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                            {news.title}
                        </h1>

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
                            <img
                                src={news.image}
                                alt={news.title}
                                className="w-full max-h-[500px] object-cover"
                            />
                        </div>

                        <div className="prose prose-lg max-w-none text-gray-800">
                            <p className="lead text-xl text-gray-600 mb-6 font-medium">
                                {news.title} hakkında detaylı bilgiler ve son gelişmeler. Bu haberin içeriği, okuyucularımıza en doğru ve güncel bilgiyi sunmak amacıyla hazırlanmıştır.
                            </p>
                            <p className="mb-6">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                            </p>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gelişmelerin Detayları</h3>
                            <p className="mb-6">
                                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                            </p>
                            <blockquote className="border-l-4 border-primary pl-4 italic text-gray-700 my-8 bg-gray-50 p-4 rounded-r-lg">
                                "Bu olay, sektördeki dengeleri değiştirecek nitelikte önemli bir gelişme olarak kaydedildi."
                            </blockquote>
                            <p className="mb-6">
                                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
                            </p>
                        </div>

                        {/* Comment Section */}
                        <CommentSection comments={news.comments} />
                    </div>

                    {/* Sidebar / Related News */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            {/* Ad above Related News */}
                            <div className="mb-6">
                                <AdBanner vertical={true} customDimensions="300x250" customHeight="h-[250px]" text="Reklam Alani 300x250" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-primary pl-4">
                                Benzer Haberler
                            </h3>
                            <div className="space-y-8">
                                {relatedNews.map((item) => (
                                    <NewsCard key={item.id} news={item} />
                                ))}
                            </div>

                            {/* Ad Placeholder 1 */}
                            <div className="mt-12">
                                <AdBanner vertical={true} customDimensions="300x250" customHeight="h-[250px] md:h-[250px]" text="Reklam Alani 300x250" />
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewsDetailPage;
