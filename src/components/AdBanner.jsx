import React from 'react';
import { Link } from 'react-router-dom';

const AdBanner = ({ vertical = false, small = false, image = null, href = null, rel = "nofollow", customHeight = null, customDimensions = null, customMobileDimensions = null, text = null }) => {
    // Dimensions for Desktop
    const desktopDimensions = customDimensions || (vertical ? "300x600" : (small ? "970x125" : "970x250"));

    // Dimensions for Mobile
    // If vertical, keep it similar or smaller. If horizontal, switch to 300x250 or 320x100
    // User requested half height for top banner on mobile, so ~125px. 320x100 is a standard size close to that.
    // For small ads (below slider), user requested square dimensions on mobile.
    // UPDATED: User requested 300x250 for mobile ads.
    const mobileDimensions = customMobileDimensions || customDimensions || (vertical ? "300x250" : (small ? "300x250" : "300x250"));

    // Height classes: Reduced mobile height for standard banner to h-[125px] (approx half of 250px)
    // For small ads: h-[300px] on mobile (square), h-[125px] on desktop
    // UPDATED: All mobile ads set to h-[250px]
    // UPDATED: Vertical ads h-[250px] on mobile, h-[600px] on desktop
    const heightClass = customHeight || (vertical ? "h-[250px] md:h-[600px]" : (small ? "h-[250px] md:h-[125px]" : "h-[250px] md:h-[250px]"));
    const widthClass = "w-full";

    // Determine content based on whether a custom image is provided
    const isCustomAd = !!image;
    const targetLink = isCustomAd ? (href || "#") : "/reklam";

    // Image URLs
    const desktopText = text || `Reklam+Alani+${desktopDimensions}`;
    const mobileText = text || `Reklam+Alani+${mobileDimensions}`;
    const desktopImage = isCustomAd ? image : `https://placehold.co/${desktopDimensions}/e0e0e0/666666?text=${desktopText}`;
    const mobileImage = isCustomAd ? image : `https://placehold.co/${mobileDimensions}/e0e0e0/666666?text=${mobileText}`;

    // Construct rel attribute
    let relAttribute = "";
    if (isCustomAd && href) {
        relAttribute = "noopener noreferrer";
        if (rel) {
            relAttribute += ` ${rel}`;
        }
    }

    return (
        <div className={`container mx-auto px-4 ${vertical ? 'py-0' : 'py-2 md:pt-8 md:pb-4'}`}>
            <Link
                to={targetLink}
                className={`${widthClass} ${heightClass} bg-gray-100 border-2 ${isCustomAd ? 'border-transparent' : 'border-dashed border-gray-300'} rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group block`}
                target={isCustomAd && href ? "_blank" : "_self"}
                rel={relAttribute}
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
