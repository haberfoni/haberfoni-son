import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { adminService } from '../services/adminService';

const AdBanner = ({ vertical = false, small = false, image = null, href = null, customHeight = null, customDimensions = null, customMobileDimensions = null, text = null, placementCode = null, newsId = null, noContainer = false }) => {
    // Refs for IntersectionObserver
    const desktopRef = useRef(null);
    const mobileRef = useRef(null);

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
    const desktopText = text || `Reklam + Alani + ${desktopDimensions} `;
    const mobileText = text || `Reklam + Alani + ${mobileDimensions} `;
    const desktopImage = isCustomAd ? image : null;
    const mobileImage = isCustomAd ? image : null;

    const { ads, settings } = useSiteSettings();
    const showEmptyAds = settings?.show_empty_ads !== 'false';
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

        // Filter ads for this specific placement
        const placementAds = ads.filter(ad =>
            ad.is_active &&
            ad.placement_code === placementCode &&
            (!ad.device_type || ad.device_type === 'all' || ad.device_type === (isMobile ? 'mobile' : 'desktop'))
        );

        // Filter by target page
        const targetedAds = placementAds.filter(ad => {
            // News ID Targeting (HIGHEST PRIORITY)
            if (ad.target_news_id) {
                // Only show if we are on a detail page AND the IDs match
                if (pageContext.type === 'detail' && newsId) {
                    return String(ad.target_news_id) === String(newsId);
                }
                // If ad has target_news_id but we are NOT on that news, do NOT show it anywhere else
                return false;
            }

            // Date Scheduling Check
            const now = new Date();
            if (ad.start_date && now < new Date(ad.start_date)) return false;
            if (ad.end_date && now > new Date(ad.end_date)) return false;

            if (ad.target_page === 'all') return true;
            if (ad.target_page === 'home' && pageContext.type === 'home') return true;
            if (ad.target_page === 'category') {
                // Show on category pages AND detail pages (unless specific category logic added later)
                return pageContext.type === 'category' || pageContext.type === 'detail';
            }
            if (ad.target_page === 'detail' && pageContext.type === 'detail') return true;
            return false;
        });

        if (targetedAds.length === 0) return null;

        // Sort by Created Date (Oldest First) or ID to maintain consistent order
        // You might want to add an 'order' field later, but for now ID or Created is fine
        return targetedAds.sort((a, b) => a.id - b.id);
    };

    const activeDesktopAds = getActiveAd(false);
    const activeMobileAds = getActiveAd(true);

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

        // Observer all ads
        // We need to observe elements regardless of whether they are desktop or mobile containers
        document.querySelectorAll(`.ad-observer-target-${placementCode}`).forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [activeDesktopAds, activeMobileAds, placementCode, location.pathname]);

    // Helper functions
    const handleClick = async (ad) => {
        try {
            await adminService.incrementAdClick(ad.id);
        } catch (error) {
            console.error('Click tracking failed:', error);
        }
        return true;
    };

    const showSponsoredLabel = settings?.show_sponsored_label !== 'false';

    const SafeScriptComponent = ({ html }) => {
        const containerRef = useRef(null);

        useEffect(() => {
            if (!containerRef.current || !html) return;

            // Clear previous content
            containerRef.current.innerHTML = '';

            // Create a temporary container to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            // Separate scripts from other content
            const scripts = Array.from(tempDiv.querySelectorAll('script'));
            const nonScriptContent = tempDiv.innerHTML;

            // 1. Insert non-script content first
            containerRef.current.innerHTML = nonScriptContent;

            // 2. Re-create and append scripts to ensure execution
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                if (oldScript.innerHTML) {
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                }
                containerRef.current.appendChild(newScript);
            });

        }, [html]);

        return <div ref={containerRef} className="w-full h-full" />;
    };

    // Helper to ensure URL is absolute
    const formatUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
            return url;
        }
        return `https://${url}`;
    };

    const renderAdContent = (ad, isMobile) => {
        if (!ad) return null;

        // Image Ad
        if (ad.type === 'image' && ad.image_url) {
            return (
                <div className="relative w-full h-full">
                    {/* Sponsored Label */}
                    {showSponsoredLabel && (
                        <div className="absolute top-0 left-0 bg-gray-800/90 text-white text-xs px-2 py-1 z-10 font-medium">
                            Sponsorlu
                        </div>
                    )}
                    <a href={formatUrl(ad.link_url)}
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
                </div>
            );
        }

        // Code / AdSense Ad
        if (ad.type === 'code' || ad.type === 'adsense') {
            return <SafeScriptComponent html={ad.code} />;
        }

        return null;
    };

    // Helper to render a single ad container
    const renderAdContainer = (ad, isMobile) => {
        const containerRef = isMobile ? mobileRef : desktopRef;

        // We use custom dimensions from AD if available, else fallback to prop dimensions
        const style = ad.width && ad.height ? { width: '100%', maxWidth: `${ad.width}px`, height: `${ad.height}px` } : {};

        const positionClass = 'relative';

        return (
            <div
                key={ad.id}
                data-ad-id={ad.id}
                className={`ad-observer-target-${placementCode} flex justify-center items-center ${widthClass} ${heightClass} group ${noContainer ? '' : 'mb-4 last:mb-0'} ${positionClass}`}
                style={customHeight ? {} : style}
            >
                {renderAdContent(ad, isMobile)}
            </div>
        );
    };

    // If no ads exist and empty ads should be hidden, return null
    if ((!activeDesktopAds || activeDesktopAds.length === 0) && (!activeMobileAds || activeMobileAds.length === 0) && !showEmptyAds) {
        return null;
    }

    // If we have ads OR we should show empty placeholders
    const hasDesktopAds = activeDesktopAds && activeDesktopAds.length > 0;
    const hasMobileAds = activeMobileAds && activeMobileAds.length > 0;

    if (hasDesktopAds || hasMobileAds || showEmptyAds) {
        return (
            <div className={`${noContainer ? '' : 'container mx-auto px-4'} ${noContainer ? '' : (vertical ? 'py-0' : 'py-2 md:pt-8 md:pb-4')} flex flex-col items-center ${noContainer ? 'gap-0' : 'gap-4'}`}>

                {/* Desktop Ads List */}
                <div className={`hidden md:flex flex-col items-center w-full ${noContainer ? 'gap-0' : 'gap-4'}`}>
                    {hasDesktopAds ? (
                        activeDesktopAds.map(ad => renderAdContainer(ad, false))
                    ) : (
                        // Placeholder
                        <div className={`flex justify-center items-center ${widthClass} ${heightClass} bg-gray-100 border-2 border-dashed border-gray-300 relative group`}>
                            <Link to={targetLink} target={isCustomAd && href ? "_blank" : "_self"} className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                                {isCustomAd ? (
                                    <img src={image} alt="Reklam" className="w-full h-full object-cover opacity-100" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                        <span className="text-sm font-medium text-gray-400 break-all">{desktopText.replace(/\+/g, ' ')}</span>
                                    </div>
                                )}
                            </Link>
                            {!isCustomAd && (
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="text-primary font-bold text-base bg-white/80 px-4 py-2 rounded shadow-sm">Reklam Ver</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Ads List */}
                <div className={`flex md:hidden flex-col items-center w-full ${noContainer ? 'gap-0' : 'gap-4'}`}>
                    {hasMobileAds ? (
                        activeMobileAds.map(ad => renderAdContainer(ad, true))
                    ) : (
                        // Placeholder
                        <div className={`flex justify-center items-center ${widthClass} ${heightClass} bg-gray-100 border-2 border-dashed border-gray-300 relative group`}>
                            <Link to={targetLink} target={isCustomAd && href ? "_blank" : "_self"} className="flex flex-col items-center justify-center w-full h-full text-gray-400">
                                {isCustomAd ? (
                                    <img src={image} alt="Reklam" className="w-full h-full object-cover opacity-100" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 text-center">
                                        <span className="text-sm font-medium text-gray-400 break-all">{mobileText.replace(/\+/g, ' ')}</span>
                                    </div>
                                )}
                            </Link>
                            {!isCustomAd && (
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="text-primary font-bold text-xs bg-white/80 px-2 py-1 rounded shadow-sm">Reklam Ver</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div >
        );
    }

    // Helper to parse dimensions string
    const getEnds = (dimStr) => {
        if (!dimStr) return { w: undefined, h: undefined };
        const [w, h] = dimStr.split('x');
        return { w, h };
    }

    const desktopDims = getEnds(desktopDimensions);
    const mobileDims = getEnds(mobileDimensions);

    // Default Fallback (Existing Logic)
    return (
        <div className={`${noContainer ? '' : 'container mx-auto px-4'} ${vertical ? 'py-0' : 'py-2 md:pt-8 md:pb-4'}`}>
            <Link
                to={targetLink}
                className={`${widthClass} ${heightClass} bg-gray-100 border-2 ${isCustomAd ? 'border-transparent' : 'border-dashed border-gray-300'} rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group block`}
                target={isCustomAd && href ? "_blank" : "_self"}
                rel={defaultRel}
            >
                {/* Desktop Content */}
                <div className="hidden md:flex w-full h-full items-center justify-center">
                    {isCustomAd && desktopImage ? (
                        <img
                            src={desktopImage}
                            alt="Reklam Alanı"
                            className="w-full h-full object-cover transition-opacity opacity-100"
                            width={desktopDims.w}
                            height={desktopDims.h}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-sm font-medium text-gray-400 break-all">{desktopText.replace(/\+/g, ' ')}</span>
                        </div>
                    )}
                </div>

                {/* Mobile Content */}
                <div className="flex md:hidden w-full h-full items-center justify-center">
                    {isCustomAd && mobileImage ? (
                        <img
                            src={mobileImage}
                            alt="Reklam Alanı"
                            className="w-full h-full object-cover transition-opacity opacity-100"
                            width={mobileDims.w}
                            height={mobileDims.h}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                            <span className="text-sm font-medium text-gray-400 break-all">{mobileText.replace(/\+/g, ' ')}</span>
                        </div>
                    )}
                </div>

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
