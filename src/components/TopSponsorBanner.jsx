import React, { useEffect, useRef } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { adminService } from '../services/adminService';
import { Link, useLocation } from 'react-router-dom';

const TopSponsorBanner = () => {
    const { ads, settings } = useSiteSettings();
    const location = useLocation();
    const showEmptyAds = settings?.show_empty_ads === 'true';

    // Helper to find ad based on device type
    const getAd = (isMobile) => {
        return ads?.find(ad =>
            ad.is_active &&
            ad.placement_code === 'home_top' &&
            (!ad.device_type || ad.device_type === 'all' || ad.device_type === (isMobile ? 'mobile' : 'desktop')) &&
            (!ad.start_date || new Date() >= new Date(ad.start_date)) &&
            (!ad.end_date || new Date() <= new Date(ad.end_date))
        );
    };

    const desktopAd = getAd(false);
    const mobileAd = getAd(true);

    // Track Views with IntersectionObserver
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const handleIntersect = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const adId = entry.target.dataset.adId;
                    if (adId) {
                        // Use session storage to prevent duplicate view counts per session
                        const viewedAds = JSON.parse(sessionStorage.getItem('viewed_ads') || '[]');
                        if (!viewedAds.includes(adId)) {
                            adminService.incrementAdView(adId).catch(console.error);
                            sessionStorage.setItem('viewed_ads', JSON.stringify([...viewedAds, adId]));
                        }
                        observer.unobserve(entry.target);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        // Function to start observing
        const startObserving = () => {
            // Observe desktop ad if exists
            const desktopEl = document.querySelector('.view-observer-target-home_top-desktop');
            if (desktopEl) observer.observe(desktopEl);

            // Observe mobile ad if exists
            const mobileEl = document.querySelector('.view-observer-target-home_top-mobile');
            if (mobileEl) observer.observe(mobileEl);
        };

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(startObserving, 500);

        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, [desktopAd, mobileAd, location.pathname]);


    const handleClick = async (adId) => {
        if (adId) {
            try {
                await adminService.incrementAdClick(adId);
            } catch (error) {
                console.error('Click tracking failed:', error);
            }
        }
    };

    // Render Logic for a single ad unit
    const renderAdUnit = (ad, isMobile) => {
        const deviceClass = isMobile ? 'flex md:hidden' : 'hidden md:flex';
        const observerClass = isMobile ? 'view-observer-target-home_top-mobile' : 'view-observer-target-home_top-desktop';
        const dimensions = isMobile ? '320x100' : '970x250';
        const heightClass = isMobile ? 'h-[100px]' : 'h-[250px]';

        if (ad) {
            return (
                <div
                    className={`${deviceClass} container mx-auto px-4 py-4 justify-center items-center`}
                >
                    <a
                        href={ad.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleClick(ad.id)}
                        className={`block w-full ${observerClass}`}
                        data-ad-id={ad.id}
                    >
                        <img
                            src={ad.image_url}
                            alt={ad.name || "Sponsor"}
                            className={`w-full ${heightClass} object-cover rounded-sm shadow-sm`}
                        />
                    </a>
                </div>
            );
        }

        if (!desktopAd && !mobileAd && !showEmptyAds) return null;

        // Fallback Placeholder if no ad for this device
        return (
            <div className={`${deviceClass} container mx-auto px-4 py-4 justify-center items-center`}>
                <div className={`w-full ${heightClass} bg-[#e5e7eb] flex flex-col items-center justify-center relative group overflow-hidden`}>
                    {/* Label */}
                    <div className="absolute top-0 left-0 bg-[#374151] text-white text-[10px] md:text-xs px-3 py-1 font-bold tracking-wide">
                        Sponsorlu
                    </div>

                    {/* Link */}
                    <Link to="/reklam" className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-gray-500 transition-colors no-underline">
                        <span className="text-2xl md:text-4xl font-semibold tracking-tight opacity-75 select-none text-center">Üst Reklam Alanı</span>
                    </Link>

                    {/* Hover Call to Action */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-gray-800 font-bold text-sm md:text-base bg-white px-4 py-2 shadow-lg transform scale-95 group-hover:scale-100 transition-transform">Reklam Ver</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Desktop Ad */}
            {renderAdUnit(desktopAd, false)}

            {/* Mobile Ad */}
            {renderAdUnit(mobileAd, true)}
        </>
    );
};

export default TopSponsorBanner;
