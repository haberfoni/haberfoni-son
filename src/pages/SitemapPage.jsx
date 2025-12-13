import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

const SitemapPage = () => {
    const [xml, setXml] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generate = async () => {
            try {
                const data = await adminService.generateSitemap();
                setXml(data);
            } catch (error) {
                console.error("Sitemap generation error:", error);
                setXml('Error generating sitemap: ' + error.message);
            } finally {
                setLoading(false);
            }
        };
        generate();
    }, []);

    if (loading) return <div>Loading sitemap...</div>;

    return (
        <pre style={{ margin: 0, padding: '1rem', fontFamily: 'monospace', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
            {xml}
        </pre>
    );
};

export default SitemapPage;
