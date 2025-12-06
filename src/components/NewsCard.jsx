import React from 'react';
import { Clock, MessageSquare, Eye } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import { Link } from 'react-router-dom';
import { slugify } from '../utils/slugify';
import { categories } from '../data/mockData';

const NewsCard = ({ news, compact = false }) => {
    // Find display name for category
    const displayCategory = categories.find(c => slugify(c) === news.category) || news.category;

    return (
        <Link to={`/kategori/${slugify(news.category)}/${news.slug || slugify(news.title)}`} className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 h-full">
            <div className={`relative overflow-hidden ${compact ? 'h-24' : 'h-28 md:h-48'}`}>
                <ImageWithFallback
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width={compact ? "200" : "400"}
                    height={compact ? "150" : "250"}
                />
                <span className={`absolute top-2 left-2 bg-primary text-white font-bold rounded ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}>
                    {displayCategory}
                </span>
            </div>
            <div className={`${compact ? 'p-2' : 'p-2 md:p-4'}`}>
                <h3 className={`font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-2 ${compact ? 'text-xs mb-1' : 'text-xs md:text-lg mb-1 md:mb-2'}`}>
                    {news.title}
                </h3>
                {/* Hide summary in compact mode to ensure visibility of title in small spaces */}
                {!compact && (
                    <p className="text-gray-600 text-[10px] md:text-sm mb-2 md:mb-3 line-clamp-2">
                        {news.summary}
                    </p>
                )}
                <div className={`flex items-center justify-between text-gray-500 border-t ${compact ? 'text-[10px] pt-1.5 mt-auto' : 'text-[10px] md:text-xs pt-2 md:pt-3'}`}>
                    <div className="flex items-center">
                        <Clock size={compact ? 10 : 12} className={`mr-1 ${!compact && 'md:hidden'}`} />
                        {!compact && <Clock size={14} className="mr-1 hidden md:block" />}
                        {news.time}
                    </div>
                    {!compact && (
                        <div className="flex items-center">
                            <Eye size={12} className="mr-1 md:hidden" />
                            <Eye size={14} className="mr-1 hidden md:block" />
                            {news.views || 1250}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default NewsCard;
