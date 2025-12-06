import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { fetchCategories } from '../services/api';
import { SOCIAL_MEDIA_LINKS } from '../constants/socialMedia';
import { slugify } from '../utils/slugify';

const Footer = () => {
    const [email, setEmail] = React.useState('');
    const [status, setStatus] = React.useState('idle'); // idle, loading, success, error
    const [message, setMessage] = React.useState('');
    const [categories, setCategories] = React.useState([]);

    React.useEffect(() => {
        const loadCategories = async () => {
            const data = await fetchCategories();
            setCategories(data.map(c => c.name));
        };
        loadCategories();
    }, []);

    const handleSubscribe = () => {
        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage('Lütfen geçerli bir e-posta adresi giriniz.');
            return;
        }

        setStatus('loading');

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            setMessage('Bültenimize başarıyla abone oldunuz!');
            setEmail('');

            // Reset message after 3 seconds
            setTimeout(() => {
                setStatus('idle');
                setMessage('');
            }, 3000);
        }, 1500);
    };

    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <a href="/" className="text-2xl font-bold tracking-tighter text-white block mb-6">
                            HABER<span className="text-primary">FONİ</span>
                        </a>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri ve özel dosyalar Haberfoni'de.
                        </p>
                        <div className="flex space-x-4">
                            <a href={SOCIAL_MEDIA_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label="Twitter">
                                <Twitter size={20} />
                            </a>
                            <a href={SOCIAL_MEDIA_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href={SOCIAL_MEDIA_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href={SOCIAL_MEDIA_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label="Youtube">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Kategoriler</h3>
                        <ul className="space-y-3">
                            {categories.map((category) => (
                                <li key={category}>
                                    <Link to={`/kategori/${slugify(category)}`} className="hover:text-primary transition-colors">
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Kurumsal</h3>
                        <ul className="space-y-3">
                            <li><Link to="/hakkimizda" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
                            <li><Link to="/kunye" className="hover:text-primary transition-colors">Künye</Link></li>
                            <li><Link to="/iletisim" className="hover:text-primary transition-colors">İletişim</Link></li>
                            <li><Link to="/reklam" className="hover:text-primary transition-colors">Reklam</Link></li>
                            <li><Link to="/kariyer" className="hover:text-primary transition-colors">Kariyer</Link></li>
                            <li><Link to="/kvkk" className="hover:text-primary transition-colors">KVKK</Link></li>
                            <li><Link to="/cerez-politikasi" className="hover:text-primary transition-colors">Çerez Politikası</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Bülten</h3>
                        <p className="text-gray-400 mb-4">
                            Gündemden haberdar olmak için bültenimize abone olun.
                        </p>
                        <div className="flex flex-col space-y-3">
                            <input
                                type="email"
                                placeholder="E-posta adresiniz"
                                aria-label="E-posta adresiniz"
                                className="bg-gray-800 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading'}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                            />
                            <button
                                onClick={handleSubscribe}
                                disabled={status === 'loading'}
                                aria-label="Bültene Abone Ol"
                                className="bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    'Abone Ol'
                                )}
                            </button>
                            {message && (
                                <p className={`text-sm ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-500 mb-4 md:mb-0">
                        &copy; 2025 Haberfoni. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
