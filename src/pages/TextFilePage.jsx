import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

const TextFilePage = ({ type }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Fetch settings directly from Supabase to skip caching if possible or use service
                const settings = await adminService.getSettings();
                if (type === 'robots') {
                    const baseUrl = window.location.origin;
                    const defaultRobots = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-news.xml
Sitemap: ${baseUrl}/rss.xml`;
                    setContent(settings.robots_txt || defaultRobots);
                } else if (type === 'ads') {
                    setContent(settings.ads_txt || '');
                }
            } catch (error) {
                console.error(`Error fetching ${type}.txt:`, error);
                setContent(`# Error fetching file\nUser-agent: *\nAllow: /`);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [type]);

    if (loading) return null; // Return empty while loading (bots wait)

    return (
        <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
            {content}
        </pre>
    );
};

export default TextFilePage;
