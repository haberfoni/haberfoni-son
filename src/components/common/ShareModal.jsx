import React, { useState } from 'react';
import { X, Copy, Check, Share2, Facebook, Twitter, Smartphone } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, title, url }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    };

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: <Smartphone className="w-5 h-5" />, // Lucide doesn't have specific WhatsApp icon, using generic or maybe add custom SVG if needed. 
            // Actually usually for projects we might use react-icons but sticking to Lucide as per project.
            // Using Smartphone as placeholder or MessageCircle
            color: 'bg-[#25D366] hover:bg-[#20bd5a] text-white',
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-5 h-5" />,
            color: 'bg-[#1877F2] hover:bg-[#166fe5] text-white',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        },
        {
            name: 'X (Twitter)',
            icon: <Twitter className="w-5 h-5" />,
            color: 'bg-black hover:bg-gray-800 text-white',
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Share2 size={18} className="text-primary" />
                        Haberi Paylaş
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Social Buttons */}
                    <div className="grid grid-cols-1 gap-2">
                        {shareLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-lg font-medium transition-colors ${link.color}`}
                            >
                                {link.icon}
                                {link.name} ile Paylaş
                            </a>
                        ))}
                    </div>

                    {/* Copy Link Section */}
                    <div className="relative mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg p-1 bg-gray-50 focus-within:ring-2 focus-within:ring-primary/20 transition-shadow">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-transparent border-none text-sm text-gray-600 px-3 focus:outline-none truncate"
                            />
                            <button
                                onClick={handleCopy}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${copied
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 shadow-sm'
                                    }`}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
