import React, { useState, useEffect } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { X } from 'lucide-react';

const SiteWarning = () => {
    const { ads } = useSiteSettings();
    const [isVisible, setIsVisible] = useState(true);
    const [activeAd, setActiveAd] = useState(null);

    useEffect(() => {
        if (ads) {
            const ad = ads.find(a =>
                a.placement_code === 'site_header_top' &&
                a.is_active &&
                (!a.start_date || new Date() >= new Date(a.start_date)) &&
                (!a.end_date || new Date() <= new Date(a.end_date))
            );
            setActiveAd(ad);
        }
    }, [ads]);

    if (!activeAd || !isVisible) return null;

    // determine content style based on ad type
    // If it's code, we render it (allows for custom text styling)
    // If it's an image, we show the image
    const isImage = activeAd.type === 'image';

    return (
        <div className="relative z-[9990] bg-primary text-white transition-all duration-300">
            <div className="container mx-auto px-4 py-2 flex items-center justify-between min-h-[40px]">

                <div className="flex-1 flex justify-center items-center text-center">
                    {isImage ? (
                        <a
                            href={activeAd.link_url || '#'}
                            target={activeAd.link_url ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="block max-h-[60px] overflow-hidden"
                        >
                            <img
                                src={activeAd.image_url}
                                alt={activeAd.name}
                                className="h-full object-contain"
                            />
                        </a>
                    ) : (
                        <div className="text-sm font-medium">
                            {activeAd.link_url ? (
                                <a
                                    href={activeAd.link_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline flex items-center gap-2 justify-center"
                                >
                                    <div dangerouslySetInnerHTML={{ __html: activeAd.code }} />
                                </a>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: activeAd.code }} />
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors ml-4 absolute right-4 top-1/2 -translate-y-1/2"
                    aria-label="Kapat"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default SiteWarning;
