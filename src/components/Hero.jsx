import React, { useState, useEffect } from 'react';
import { Clock, Eye, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

import { slugify } from '../utils/slugify';
import { categories } from '../data/mockData';

const Hero = ({ items = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (items.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [items]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };



    return (
        <section className="container mx-auto px-4 py-4">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Main Slider (66%) */}
                <div className="lg:w-2/3 relative h-[250px] md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden group">
                    <div
                        className="flex h-full transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {items.map((item, index) => {
                            const displayCategory = categories.find(c => slugify(c) === item.category) || item.category;
                            return (
                                <div key={item.id} className="min-w-full h-full relative">
                                    <Link to={`/kategori/${slugify(item.category)}/${item.slug || slugify(item.title)}`} className="block w-full h-full">
                                        <ImageWithFallback
                                            src={item.image}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                            loading={index === 0 ? "eager" : "lazy"}
                                            fetchPriority={index === 0 ? "high" : "auto"}
                                            width="800"
                                            height="500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                        <div className="absolute bottom-0 left-0 p-6 w-full">
                                            <span className="inline-block px-2 py-1 bg-primary text-white text-xs font-bold uppercase mb-2">
                                                {displayCategory}
                                            </span>
                                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                                                {item.title}
                                            </h1>
                                        </div>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>

                    {/* Navigation buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-primary text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Previous Slide"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-primary text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Next Slide"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Pagination */}
                    <div className="absolute bottom-4 right-4 flex gap-1">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-all ${currentIndex === index
                                    ? 'bg-primary w-6'
                                    : 'bg-white/50 hover:bg-white'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Side List (33%) - Surmanşet */}
                <div className="lg:w-1/3 flex flex-col gap-2 h-[300px] lg:h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {items.map((item, index) => (
                        <Link
                            key={item.id}
                            to={`/kategori/${slugify(item.category)}/${item.slug || slugify(item.title)}`}
                            className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${currentIndex === index ? 'bg-gray-100 border-primary' : 'bg-white border-transparent hover:bg-gray-50'}`}
                            onMouseEnter={() => goToSlide(index)}
                        >
                            <div className="w-24 h-16 flex-shrink-0 rounded overflow-hidden">
                                <ImageWithFallback
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    width="96"
                                    height="64"
                                />
                            </div>
                            <div className="flex flex-col justify-between">
                                <h3 className={`text-sm font-bold leading-snug line-clamp-2 ${currentIndex === index ? 'text-primary' : 'text-gray-800'}`}>
                                    {item.title}
                                </h3>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <Clock size={12} className="mr-1" />
                                    {item.time}
                                </div>
                            </div>
                        </Link>
                    ))}

                </div>
            </div>
        </section>
    );
};

export default Hero;
