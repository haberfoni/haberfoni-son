import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, TrendingUp, ArrowRight } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { slugify } from '../utils/slugify';

const BreakingNews = ({ items = [] }) => {
    if (!items.length) return null;

    return (
        <section className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-red-600">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-600 text-white p-2 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Son Dakika</h2>
                    </div>
                    <Link to="/tum-haberler" className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
                        Tümünü Gör
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {/* News Grid - 2 Columns (8 items) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.slice(0, 8).map((news) => (
                        <Link
                            key={news.id}
                            to={`/${news.category || 'haber'}/${slugify(news.title)}/${news.id}`}
                            className="group flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                        >
                            {/* Image */}
                            <div className="relative w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                <ImageWithFallback
                                    src={news.image || news.image_url}
                                    alt={news.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    width="128"
                                    height="96"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                {/* Title */}
                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                                    {news.title}
                                </h3>

                                {/* Time */}
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                                    <Clock size={12} />
                                    <span>{news.time || 'Az önce'}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BreakingNews;
