import React from 'react';
import { Globe, Share2 } from 'lucide-react';

const SeoPreview = ({ title, description, image, url, date }) => {
    const siteUrl = 'https://haberfoni.com';
    const displayUrl = url ? `${siteUrl}${url}` : siteUrl;

    // Limits
    const googleTitle = title?.slice(0, 60) + (title?.length > 60 ? '...' : '') || 'Haberfoni - En Güncel Haberler';
    const googleDesc = description?.slice(0, 160) + (description?.length > 160 ? '...' : '') || 'Haberfoni sitesinden en güncel haberler ve gelişmeler.';

    const socialTitle = title || 'Haber Başlığı';
    const socialDesc = description || 'Haber açıklaması burada görünecek...';

    return (
        <div className="space-y-6 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">Önizleme</h3>

            {/* Google Search Result Preview */}
            <div className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                    <div className="bg-gray-100 p-1 rounded-full">
                        <Globe size={14} className="text-gray-600" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-800 font-medium">Haberfoni</span>
                        <span className="text-[10px] text-gray-500">{displayUrl}</span>
                    </div>
                </div>
                <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-medium truncate">
                    {googleTitle}
                </h3>
                <div className="text-sm text-gray-600 mt-1">
                    {date && <span className="text-gray-500 mr-2">{new Date(date).toLocaleDateString('tr-TR')} —</span>}
                    {googleDesc}
                </div>
            </div>

            {/* Social Media Card Preview */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white max-w-md">
                <div className="bg-gray-50 p-2 border-b border-gray-100 flex items-center space-x-2 text-xs text-gray-500">
                    <Share2 size={12} />
                    <span>Sosyal Medya Kartı (Facebook / Twitter)</span>
                </div>
                <div className="relative h-48 bg-gray-100">
                    {image ? (
                        <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Görsel Yok
                        </div>
                    )}
                </div>
                <div className="p-3 bg-[#f0f2f5] border-t border-gray-100">
                    <div className="uppercase text-[10px] text-gray-500 mb-1">HABERFONI.COM</div>
                    <div className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                        {socialTitle}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2 leading-snug">
                        {socialDesc}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeoPreview;
