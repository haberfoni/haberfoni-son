
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Github, MessageCircle, Music2, Globe, Mail, Phone, MapPin, Twitch } from 'lucide-react';

export const SOCIAL_ICONS = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    youtube: Youtube,
    linkedin: Linkedin,
    github: Github,
    whatsapp: MessageCircle,
    tiktok: Music2,
    twitch: Twitch,
    website: Globe,
    email: Mail,
    phone: Phone,
    location: MapPin
};

export const getIcon = (name) => {
    return SOCIAL_ICONS[name?.toLowerCase()] || Globe;
};

export const SOCIAL_PLATFORMS = [
    { id: 'facebook', name: 'Facebook' },
    { id: 'twitter', name: 'Twitter (X)' },
    { id: 'instagram', name: 'Instagram' },
    { id: 'youtube', name: 'Youtube' },
    { id: 'tiktok', name: 'TikTok' },
    { id: 'linkedin', name: 'LinkedIn' },
    { id: 'whatsapp', name: 'WhatsApp' },
    { id: 'twitch', name: 'Twitch' },
    { id: 'github', name: 'Github' },
    { id: 'website', name: 'Web Sitesi' },
    { id: 'email', name: 'E-posta' }
];

export const getSocialLinksFromSettings = (settings) => {
    if (!settings) return [];

    // 1. Try to parse new dynamic list
    if (settings.social_links) {
        try {
            const parsed = JSON.parse(settings.social_links);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error("Error parsing social_links in frontend", e);
        }
    }

    // 2. Fallback to legacy fields
    const legacyLinks = [];
    if (settings.social_facebook) legacyLinks.push({ platform: 'facebook', url: settings.social_facebook });
    if (settings.social_twitter) legacyLinks.push({ platform: 'twitter', url: settings.social_twitter });
    if (settings.social_instagram) legacyLinks.push({ platform: 'instagram', url: settings.social_instagram });
    if (settings.social_youtube) legacyLinks.push({ platform: 'youtube', url: settings.social_youtube });

    return legacyLinks;
};
