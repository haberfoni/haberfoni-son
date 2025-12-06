import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

const ImageWithFallback = ({ src, alt, className, ...props }) => {
    const [error, setError] = useState(false);

    if (!src || error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-100 text-gray-400 border border-gray-200 ${className}`} {...props}>
                <ImageOff className="w-1/3 h-1/3 opacity-40 mb-2" />
                <span className="text-[10px] md:text-xs font-medium uppercase tracking-wider opacity-60">Görsel Yok</span>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    );
};

export default ImageWithFallback;
