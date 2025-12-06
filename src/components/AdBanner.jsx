import React, { useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { adminService } from '../services/adminService';

const AdBanner = ({ vertical = false, small = false, image = null, href = null, customHeight = null, customDimensions = null, customMobileDimensions = null, text = null, placementCode = null }) => {
    // Dimensions for Desktop
    const desktopDimensions = customDimensions || (vertical ? "300x600" : (small ? "970x125" : "970x250"));

    // Dimensions for Mobile
    const mobileDimensions = customMobileDimensions || customDimensions || (vertical ? "300x250" : (small ? "300x250" : "300x250"));

    const heightClass = customHeight || (vertical ? "h-[250px] md:h-[600px]" : (small ? "h-[250px] md:h-[125px]" : "h-[250px] md:h-[250px]"));
    const widthClass = "w-full";

    // Determine content based on whether a custom image is provided
    const isCustomAd = !!image;
    const targetLink = isCustomAd ? (href || "#") : "/reklam";
    const defaultRel = isCustomAd && href ? "noopener noreferrer nofollow" : "nofollow";

    // Image URLs
    const desktopText = text || `Reklam+Alani+${desktopDimensions}`;
    const mobileText = text || `Reklam+Alani+${mobileDimensions}`;
    const desktopImage = isCustomAd ? image : `https://placehold.co/${desktopDimensions}/e0e0e0/666666?text=${desktopText}`;
    const mobileImage = isCustomAd ? image : `https://placehold.co/${mobileDimensions}/e0e0e0/666666?text=${mobileText}`;

    const { ads } = useSiteSettings();
    const location = useLocation();

    // Determine current page context
    const pageContext = useMemo(() => {
        const path = location.pathname;
        if (path === '/') return { type: 'home', category: null };
        if (path.startsWith('/kategori/')) {
            const parts = path.split('/');
            if (parts.length > 3) return { type: 'detail', category: parts[2] };
            return { type: 'category', category: parts[2] };
        }
        if (path.startsWith('/foto-galeri') || path.startsWith('/video-galeri')) {
            if (path.split('/').length > 2) return { type: 'detail', category: 'galeri' };
            return { type: 'category', category: 'galeri' };
        }
        return { type: 'other', category: null };
    }, [location.pathname]);

    // Helper to filter ads
    const getActiveAd = (isMobile) => {
        if (!ads) return null;

        const dimToSearch = isMobile ? mobileDimensions : desktopDimensions;

        return ads.find(ad => {
            // 0. Base Check
            if (!ad.is_active) return false;

            // 1. Placement Code Check (Priority)
            if (placementCode) {
                if (ad.placement_code !== placementCode) return false;
            } else {
                // Fallback to dimension check if no placement code provided (Legacy support)
                const matchesDim = (ad.width + 'x' + ad.height) === dimToSearch;
                if (!matchesDim) return false;

                // Also filter out ads that HAVE a specific placement code but we aren't asking for it
                // This prevents "sidebar_top" ads from showing up in generic "300x250" slots accidentally if they happen to match size
                // Only generic ads (without specific placement codes or with 'generic' code) should show in generic slots?
                // For now, let's allow it to keep backward compatibility, but ideally we should be strict.
            }

            // 2. Device Check
            const matchesDevice = (ad.device_type === 'all' || ad.device_type === (isMobile ? 'mobile' : 'desktop'));
            if (!matchesDevice) return false;

            // 3. Targeting Check
            const targetPage = ad.target_page || 'all';
            const targetCategory = ad.target_category;

            // Page Type Check
            if (targetPage !== 'all') {
                if (targetPage !== pageContext.type) return false;
            }

            // Category Check
            if (targetCategory && targetCategory.trim() !== '') {
                if (!pageContext.category) return false;
                if (pageContext.category !== targetCategory) return false;
            }

            return true;
        });
    };

    const activeDesktopAd = getActiveAd(false);
    const activeMobileAd = getActiveAd(true);

    // Track Views
    useEffect(() => {
        const trackView = (adId) => {
            const viewedAds = JSON.parse(sessionStorage.getItem('viewed_ads') || '[]');
            if (!viewedAds.includes(adId)) {
                adminService.incrementAdView(adId).catch(console.error);
                sessionStorage.setItem('viewed_ads', JSON.stringify([...viewedAds, adId]));
            }
        };

        if (activeDesktopAd) trackView(activeDesktopAd.id);
        if (activeMobileAd) trackView(activeMobileAd.id);
    }, [activeDesktopAd, activeMobileAd]);

    const handleClick = async (ad) => {
        try {
            await adminService.incrementAdClick(ad.id);
        } catch (error) {
            console.error('Click tracking failed:', error);
        }
        return true;
    };

    const renderAdContent = (ad, isMobile) => {
        if (!ad) return null;

        // Image Ad
        if (ad.type === 'image' && ad.image_url) {
            return (
                <a href={ad.link_url || '#'}
                    target="_blank"
                    rel={ad.rel_attribute || "nofollow"}
                    onClick={() => handleClick(ad)}
                    className="flex w-full h-full items-center justify-center">
                    <img
                        src={ad.image_url}
                        alt={ad.name}
                        className="w-full h-full object-cover"
                    />
                </a>
            );
        }

        // Code Ad
        return <div dangerouslySetInnerHTML={{ __html: ad.code }} />;
    };

    if (activeDesktopAd || activeMobileAd) {
        return (
            <div className={`container mx-auto px-4 ${vertical ? 'py-0' : 'py-2 md:pt-8 md:pb-4'}`}>
                {/* Desktop Ad Container */}
                <div className={`hidden md:flex justify-center items-center ${widthClass} ${heightClass} ${!activeDesktopAd ? 'bg-gray-100 border-2 border-dashed border-gray-300' : ''}`}>
                    {activeDesktopAd ? (
                        renderAdContent(activeDesktopAd, false)
                    ) : (
                        // Fallback to placeholder if only mobile ad exists
                        <Link to={targetLink} target={isCustomAd && href ? "_blank" : "_self"} className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                            <img src={desktopImage} alt="Reklam" className="w-full h-full object-cover opacity-50" />
                        </Link>
                    )}
                </div>

                {/* Mobile Ad Container */}
                <div className={`flex md:hidden justify-center items-center ${widthClass} ${heightClass} ${!activeMobileAd ? 'bg-gray-100 border-2 border-dashed border-gray-300' : ''}`}>
                    {activeMobileAd ? (
                        renderAdContent(activeMobileAd, true)
                    ) : (
                        <Link to={targetLink} target={isCustomAd && href ? "_blank" : "_self"} className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                            <img src={mobileImage} alt="Reklam" className="w-full h-full object-cover opacity-50" />
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    // Default Fallback (Existing Logic)
    return (
        <div className={`container mx-auto px-4 ${vertical ? 'py-0' : 'py-2 md:pt-8 md:pb-4'}`}>
            <Link
                to={targetLink}
                className={`${widthClass} ${heightClass} bg-gray-100 border-2 ${isCustomAd ? 'border-transparent' : 'border-dashed border-gray-300'} rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group block`}
                target={isCustomAd && href ? "_blank" : "_self"}
                rel={defaultRel}
            >
                {/* Desktop Image */}
                <img
                    src={desktopImage}
                    alt="Reklam Alanı"
                    className={`hidden md:block w-full h-full object-cover transition-opacity ${isCustomAd ? 'opacity-100' : 'opacity-50 group-hover:opacity-75'}`}
                />

                {/* Mobile Image */}
                <img
                    src={mobileImage}
                    alt="Reklam Alanı"
                    className={`block md:hidden w-full h-full object-cover transition-opacity ${isCustomAd ? 'opacity-100' : 'opacity-50 group-hover:opacity-75'}`}
                />

                {/* Hover Effect Overlay - Only for placeholders */}
                {!isCustomAd && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-primary font-bold text-xs md:text-base bg-white/80 px-2 py-1 md:px-4 md:py-2 rounded shadow-sm">Reklam Ver</span>
                    </div>
                )}
            </Link>
        </div>
    );
};

export default AdBanner;
