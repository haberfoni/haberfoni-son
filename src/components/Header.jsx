import React, { useState, useEffect } from 'react';
import { Search, Menu, X, TrendingUp, TrendingDown, Facebook, Twitter, Camera, Video } from 'lucide-react';
import WeatherWidget from './WeatherWidget';
import { Link, useNavigate } from 'react-router-dom';
import { categories, financialData } from '../data/mockData';
import { SOCIAL_MEDIA_LINKS } from '../constants/socialMedia';
import { slugify } from '../utils/slugify';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currencyData, setCurrencyData] = useState(financialData);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCurrencyData = async () => {
            try {
                const res = await fetch('https://finans.truncgil.com/today.json');
                const data = await res.json();

                if (data) {
                    setCurrencyData(prevData => prevData.map(item => {
                        let apiItem = null;

                        if (item.name === 'DOLAR') apiItem = data.USD;
                        else if (item.name === 'EURO') apiItem = data.EUR;
                        else if (item.name === 'ALTIN') apiItem = data['gram-altin'];

                        if (apiItem) {
                            // Parse "5.745,39" to 5745.39
                            const rawValue = apiItem.Satış;
                            const parsedValue = parseFloat(rawValue.replace(/\./g, '').replace(',', '.'));

                            // Format back to Turkish format: "5.745,39"
                            const value = new Intl.NumberFormat('tr-TR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(parsedValue);

                            // Parse "%0,00" to determine direction
                            const changeStr = apiItem.Değişim.replace('%', '').replace(',', '.');
                            const change = parseFloat(changeStr);
                            const direction = change >= 0 ? 'up' : 'down';

                            return {
                                ...item,
                                value: value,
                                change: `%${Math.abs(change).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
                                direction: direction
                            };
                        }
                        return item;
                    }));
                }
            } catch (error) {
                console.error("Error fetching currency data:", error);
            }
        };

        fetchCurrencyData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchCurrencyData, 300000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery(''); // Optional: clear after search
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm">
            {/* Top Bar - Financial Data & Utilities */}
            <div className="bg-gray-50 border-b border-gray-200 text-xs py-1.5 overflow-hidden">
                <div className="container mx-auto px-4 flex items-center justify-between">

                    {/* Left Side: Financial Data */}
                    <div className="flex-1 mr-4 overflow-hidden relative group [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                        <div className="flex items-center w-max animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
                            {/* Original Data */}
                            <div className="flex items-center space-x-8 pr-8">
                                <div className="hidden md:block text-gray-500 font-medium mr-2">
                                    {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {currencyData.map((item) => (
                                    <div key={`orig-${item.name}`} className="flex items-center space-x-2">
                                        <span className="font-bold text-gray-700">{item.name}</span>
                                        <span className="font-mono text-gray-600">{item.value}</span>
                                        <span className={`flex items-center ${item.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.direction === 'up' ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                                            <span className="text-[10px]">{item.change}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {/* Duplicated Data for Seamless Loop */}
                            <div className="flex items-center space-x-8 pr-8">
                                <div className="hidden md:block text-gray-500 font-medium mr-2">
                                    {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                {currencyData.map((item) => (
                                    <div key={`dup-${item.name}`} className="flex items-center space-x-2">
                                        <span className="font-bold text-gray-700">{item.name}</span>
                                        <span className="font-mono text-gray-600">{item.value}</span>
                                        <span className={`flex items-center ${item.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.direction === 'up' ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
                                            <span className="text-[10px]">{item.change}</span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Social, Galleries, Weather */}
                    <div className="flex items-center space-x-4 shrink-0">
                        {/* Social Icons */}
                        <div className="hidden md:flex items-center space-x-3 border-r border-gray-300 pr-4">
                            <a href={SOCIAL_MEDIA_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors" aria-label="Facebook"><Facebook size={14} /></a>
                            <a href={SOCIAL_MEDIA_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-black transition-colors" aria-label="Twitter"><Twitter size={14} /></a>
                        </div>

                        {/* Gallery Links */}
                        <div className="hidden lg:flex items-center space-x-4 border-r border-gray-300 pr-4">
                            <Link to="/foto-galeri" className="flex items-center space-x-1 text-gray-700 hover:text-primary font-bold uppercase tracking-tight">
                                <Camera size={14} />
                                <span>FOTO GALERİ</span>
                            </Link>
                            <Link to="/video-galeri" className="flex items-center space-x-1 text-gray-700 hover:text-primary font-bold uppercase tracking-tight">
                                <Video size={14} />
                                <span>VİDEO GALERİ</span>
                            </Link>
                        </div>

                        {/* Weather Widget */}
                        <WeatherWidget />
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/" className="text-3xl font-black tracking-tighter italic" onClick={() => window.scrollTo(0, 0)}>
                                HABER<span className="text-primary">FONİ</span>
                            </Link>
                        </div>

                        {/* Search & Mobile Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2">
                                <input
                                    type="text"
                                    placeholder="Haber ara..."
                                    className="bg-transparent border-none outline-none text-sm w-48"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    aria-label="Haber ara"
                                />
                                <button onClick={handleSearch} aria-label="Ara">
                                    <Search size={18} className="text-gray-500 hover:text-primary transition-colors" />
                                </button>
                            </div>
                            <button
                                className="lg:hidden p-2 text-gray-600"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label={isMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:block border-b border-gray-200 bg-gray-50">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-between text-sm font-bold text-gray-700 h-10">
                        {categories.map((category) => (
                            <li key={category}>
                                <Link
                                    to={`/kategori/${slugify(category)}`}
                                    className="hover:text-primary hover:bg-white px-3 py-2 rounded-t-md transition-all block border-b-2 border-transparent hover:border-primary"
                                >
                                    {category.toUpperCase()}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg h-[calc(100vh-100px)] overflow-y-auto">
                    <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
                        {categories.map((category) => (
                            <Link
                                key={category}
                                to={`/kategori/${slugify(category)}`}
                                className="text-gray-700 font-bold py-3 border-b border-gray-100 hover:text-primary hover:pl-2 transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {category.toUpperCase()}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
