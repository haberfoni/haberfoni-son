import React from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const SiteAlert = () => {
    const { settings } = useSiteSettings();
    const [isVisible, setIsVisible] = useState(true);

    // Re-show if settings change
    useEffect(() => {
        setIsVisible(true);
    }, [settings?.site_warning_text, settings?.site_warning_type]);

    if (!settings || settings.site_warning_active !== 'true' || !settings.site_warning_text || !isVisible) {
        return null;
    }

    const type = settings.site_warning_type || 'info';
    
    // Determine colors and icon based on type
    const config = {
        info: {
            bg: 'bg-blue-600',
            text: 'text-white',
            border: 'border-blue-700',
            icon: <Info className="w-5 h-5 text-blue-100" />
        },
        success: {
            bg: 'bg-green-600',
            text: 'text-white',
            border: 'border-green-700',
            icon: <CheckCircle className="w-5 h-5 text-green-100" />
        },
        warning: {
            bg: 'bg-yellow-500',
            text: 'text-gray-900',
            border: 'border-yellow-600',
            icon: <AlertTriangle className="w-5 h-5 text-yellow-900" />
        },
        error: {
            bg: 'bg-red-600',
            text: 'text-white',
            border: 'border-red-700',
            icon: <AlertCircle className="w-5 h-5 text-red-100" />
        }
    };

    const currentStyle = config[type] || config.info;

    return (
        <div className={`relative ${currentStyle.bg} ${currentStyle.text} ${currentStyle.border} border-b px-4 py-3 shadow-sm z-50`}>
            <div className="container mx-auto max-w-7xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <span className="flex-shrink-0 animate-pulse">
                        {currentStyle.icon}
                    </span>
                    <p className="text-sm md:text-base font-medium pr-6 text-balance leading-tight">
                        {settings.site_warning_text}
                    </p>
                </div>
                <button 
                    onClick={() => setIsVisible(false)}
                    className="flex-shrink-0 p-1 rounded-md opacity-80 hover:opacity-100 hover:bg-black/10 transition-all focus:outline-none"
                    aria-label="Kapat"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default SiteAlert;
