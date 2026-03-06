import React from 'react';

const SourceBadge = ({ source, className = '' }) => {
    if (!source) return null;

    return (
        <span className={`text-[0.75rem] italic font-medium text-gray-500 ${className}`}>
            {source}
        </span>
    );
};

export default SourceBadge;
