import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { fetchCategories } from '../services/api';
import { SOCIAL_MEDIA_LINKS } from '../constants/socialMedia';
import { slugify } from '../utils/slugify';
import { supabase } from '../services/supabase';
import { adminService } from '../services/adminService';

import { getSocialLinksFromSettings, getIcon } from '../utils/iconMapper';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Footer = () => {
    const { settings } = useSiteSettings();
    const socialLinks = getSocialLinksFromSettings(settings); // Get normalized links

    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');
    const [categories, setCategories] = useState([]);
    const [footerSections, setFooterSections] = useState([]);
    const [sectionLinks, setSectionLinks] = useState({});

    useEffect(() => {
        const loadCategories = async () => {
            const data = await fetchCategories();
            setCategories(data.map(c => c.name));
        };
        loadCategories();
    }, []);

    useEffect(() => {
        // Fetch Footer Sections and Links
        const loadFooterData = async () => {
            try {
                // 1. Get Sections
                const sectionsData = await adminService.getFooterSections();
                const activeSections = sectionsData?.filter(s => s.is_active) || [];
                setFooterSections(activeSections);

                // 2. Get Links for each section
                const linksMap = {};
                for (const section of activeSections) {
                    if (section.type === 'custom_links') {
                        const links = await adminService.getFooterLinks(section.id);
                        linksMap[section.id] = links?.filter(l => l.is_active) || [];
                    }
                }
                setSectionLinks(linksMap);

            } catch (err) {
                console.error('Error loading footer data:', err);
            }
        };
        loadFooterData();
    }, []);

    const handleSubscribe = async () => {
        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage('Lütfen geçerli bir e-posta adresi giriniz.');
            return;
        }

        setStatus('loading');

        try {
            // Save to Supabase subscribers table
            const { data, error } = await supabase
                .from('subscribers')
                .insert([{ email, is_active: true }])
                .select();

            if (error) {
                // Check if email already exists
                if (error.code === '23505') {
                    setStatus('error');
                    setMessage('Bu e-posta adresi zaten kayıtlı.');
                } else {
                    throw error;
                }
            } else {
                setStatus('success');
                setMessage('Bültenimize başarıyla abone oldunuz!');
                setEmail('');

                // Reset message after 3 seconds
                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, 3000);
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setStatus('error');
            setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div>
                        <a href="/" className="block mb-6">
                            {settings.logo_desktop ? (
                                <img
                                    src={settings.logo_desktop}
                                    alt={settings.site_title || "Haberfoni"}
                                    className="h-10 w-auto object-contain"
                                />
                            ) : (
                                <span className="text-2xl font-bold tracking-tighter text-white">
                                    HABER<span className="text-primary">FONİ</span>
                                </span>
                            )}
                        </a>
                        <p className="text-gray-400 mb-6 leading-relaxed break-words whitespace-pre-line">
                            {settings.site_description || "Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri ve özel dosyalar Haberfoni'de."}
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((link, index) => {
                                const Icon = getIcon(link.platform);
                                return (
                                    <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all" aria-label={link.platform}>
                                        <Icon size={20} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dynamic Sections Loop */}
                    {footerSections.map(section => (
                        <div key={section.id}>
                            <h3 className="text-white font-bold text-lg mb-6">{section.title}</h3>
                            <ul className={`space-y-${section.type === 'dynamic_categories' ? '3' : '4'}`}>
                                {section.type === 'dynamic_categories' ? (
                                    // Categories Logic
                                    categories.map((category) => (
                                        <li key={category}>
                                            <Link to={`/kategori/${slugify(category)}`} className="hover:text-primary transition-colors">
                                                {category}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    // Custom Links Logic
                                    sectionLinks[section.id]?.map(link => (
                                        <li key={link.id}>
                                            <a
                                                href={link.url}
                                                target={link.open_in_new_tab ? "_blank" : "_self"}
                                                rel={link.open_in_new_tab ? "noopener noreferrer" : ""}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {link.title}
                                            </a>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter */}
                    {settings.footer_show_newsletter !== 'false' && (
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
                    )}
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-500 mb-4 md:mb-0">
                        {settings.site_copyright || `© ${new Date().getFullYear()} Haberfoni. Tüm hakları saklıdır.`}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
