import React from 'react';
import { Clock, MessageSquare, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { slugify } from '../utils/slugify';

const NewsCard = ({ news }) => {
    return (
        <Link to={`/kategori/${slugify(news.category)}/${slugify(news.title)}`} className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="relative h-28 md:h-48 overflow-hidden">
                <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    width="400"
                    height="250"
                />
                <span className="absolute top-2 left-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                    {news.category}
                </span>
            </div>
            <div className="p-2 md:p-4">
                <h3 className="text-xs md:text-lg font-bold text-gray-900 mb-1 md:mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                </h3>
                <p className="text-gray-600 text-[10px] md:text-sm mb-2 md:mb-3 line-clamp-2">
                    {news.summary}
                </p>
                <div className="flex items-center justify-between text-[10px] md:text-xs text-gray-500 border-t pt-2 md:pt-3">
                    <div className="flex items-center">
                        <Clock size={12} className="mr-1 md:hidden" />
                        <Clock size={14} className="mr-1 hidden md:block" />
                        {news.time}
                    </div>
                    <div className="flex items-center">
                        <Eye size={12} className="mr-1 md:hidden" />
                        <Eye size={14} className="mr-1 hidden md:block" />
                        {news.views || 1250}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default NewsCard;
