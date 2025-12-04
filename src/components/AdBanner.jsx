import React from 'react';
import { Link } from 'react-router-dom';

const AdBanner = ({ vertical = false, small = false, image = null, href = null, rel = "nofollow", customHeight = null, customDimensions = null }) => {
    const dimensions = customDimensions || (vertical ? "300x600" : (small ? "970x125" : "970x250"));
    const heightClass = customHeight || (vertical ? "h-[600px]" : (small ? "h-[75px] md:h-[125px]" : "h-[150px] md:h-[250px]"));
    const widthClass = vertical ? "w-full" : "w-full";

    // Determine content based on whether a custom image is provided
    const isCustomAd = !!image;
    const targetLink = isCustomAd ? (href || "#") : "/reklam";
    const displayImage = isCustomAd ? image : `https://placehold.co/${dimensions}/e0e0e0/666666?text=Reklam+Alani+${dimensions}`;

    // Construct rel attribute
    // Always add noopener noreferrer for external links for security
    // Add user-defined rel (e.g. "nofollow") if provided
    let relAttribute = "";
    if (isCustomAd && href) {
        relAttribute = "noopener noreferrer";
        if (rel) {
            relAttribute += ` ${rel}`;
        }
    }

    return (
        <div className={`container mx-auto px-4 ${vertical ? 'py-0' : 'pt-8 pb-4'}`}>
            <Link
                to={targetLink}
                className={`${widthClass} ${heightClass} bg-gray-100 border-2 ${isCustomAd ? 'border-transparent' : 'border-dashed border-gray-300'} rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group block`}
                target={isCustomAd && href ? "_blank" : "_self"}
                rel={relAttribute}
            >
                <img
                    src={displayImage}
                    alt="Reklam Alanı"
                    className={`w-full h-full object-cover transition-opacity ${isCustomAd ? 'opacity-100' : 'opacity-50 group-hover:opacity-75'}`}
                />

                {/* Hover Effect Overlay - Only for placeholders */}
                {!isCustomAd && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-primary font-bold bg-white/80 px-4 py-2 rounded shadow-sm">Reklam Ver</span>
                    </div>
                )}
            </Link>
        </div>
    );
};

export default AdBanner;
