import React from 'react';
import { getSourceLogo } from '../constants/sourceLogos';

const SourceBadge = ({ source, className = '', showText = false }) => {
    const [imageError, setImageError] = React.useState(false);

    if (!source) return null;

    const logoUrl = getSourceLogo(source);

    if (logoUrl && !imageError) {
        return (
            <div className={`flex items-center ${className}`} title={source}>
                <img
                    src={logoUrl}
                    alt={`${source} Logo`}
                    className="h-6 w-auto object-contain max-w-[80px]"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <span className={`font-bold text-primary ${className}`}>
            {source}
        </span>
    );
};

export default SourceBadge;
