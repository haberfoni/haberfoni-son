import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { adminService } from '../services/adminService';

const PopupAd = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [ad, setAd] = useState(null);
    const { ads } = useSiteSettings();

    useEffect(() => {
        // Check if popup has already been shown in this session
        const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');
        if (hasSeenPopup) return;

        // Find active popup ad
        if (ads) {
            const popupAd = ads.find(a =>
                a.placement_code === 'site_popup' &&
                a.is_active &&
                (!a.start_date || new Date() >= new Date(a.start_date)) &&
                (!a.end_date || new Date() <= new Date(a.end_date))
            );

            if (popupAd) {
                setAd(popupAd);
                // Delay slightly for better UX (don't slam immediately on load)
                setTimeout(() => setIsVisible(true), 1000);
            }
        }
    }, [ads]);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenPopup', 'true');
    };

    const handleAdClick = async () => {
        if (ad) {
            try {
                await adminService.incrementAdClick(ad.id);
            } catch (error) {
                console.error('Click tracking failed:', error);
            }
        }
    };

    if (!isVisible || !ad) return null;

    // Helper to fix URL protocol if missing
    const getSafeUrl = (url) => {
        if (!url) return '#';
        if (!/^https?:\/\//i.test(url)) {
            return 'https://' + url;
        }
        return url;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 z-10 p-1 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Ad Content */}
                <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50">
                    {ad.type === 'code' || ad.type === 'adsense' ? (
                        <div
                            className="w-full h-full flex items-center justify-center p-4"
                            dangerouslySetInnerHTML={{ __html: ad.code }}
                        />
                    ) : (
                        <a
                            href={getSafeUrl(ad.link_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleAdClick}
                            className="block w-full h-full"
                        >
                            <img
                                src={ad.image_url}
                                alt={ad.name}
                                className="w-full h-full object-contain max-h-[85vh]"
                            />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopupAd;
