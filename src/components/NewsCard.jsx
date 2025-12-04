import React from 'react';
import { Clock, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { slugify } from '../utils/slugify';

const NewsCard = ({ news }) => {
    return (
        <Link to={`/kategori/${slugify(news.category)}/${slugify(news.title)}`} className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="relative h-48 overflow-hidden">
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
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {news.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                    <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {news.time}
                    </div>
                    <div className="flex items-center">
                        <MessageSquare size={14} className="mr-1" />
                        0 Yorum
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default NewsCard;
