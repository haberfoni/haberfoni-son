import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

const SitemapPage = ({ type = 'sitemap' }) => {
    const [xml, setXml] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generate = async () => {
            try {
                let data = '';
                if (type === 'news-sitemap') {
                    data = await adminService.generateNewsSitemap();
                } else if (type === 'rss') {
                    data = await adminService.generateRSS();
                } else {
                    data = await adminService.generateSitemap();
                }
                setXml(data);
            } catch (error) {
                console.error("XML generation error:", error);
                setXml('Error generating XML: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        generate();
    }, [type]);

    if (loading) return <div>Loading...</div>;

    return (
        <pre style={{ margin: 0, padding: '1rem', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {xml}
        </pre>
    );
};

export default SitemapPage;
