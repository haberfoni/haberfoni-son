import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { adminService } from '../services/adminService';

const DynamicPage = () => {
    const { slug } = useParams();

    // Redirect special pages to their React components
    if (slug === 'reklam') return <Navigate to="/reklam" replace />;
    if (slug === 'iletisim') return <Navigate to="/iletisim" replace />;
    if (slug === 'hakkimizda') return <Navigate to="/hakkimizda" replace />;

    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadPage();
    }, [slug]);

    const loadPage = async () => {
        try {
            setLoading(true);
            setError(false);
            const data = await adminService.getPageBySlug(slug);
            if (data) {
                setPage(data);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Error loading page:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Sayfa Bulunamadı</h1>
                <p className="text-gray-600 mb-8">Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
                <a href="/" className="bg-primary text-white px-6 py-3 rounded-full hover:opacity-90 transition-opacity">
                    Ana Sayfaya Dön
                </a>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <SEO
                title={page.meta_title || page.title}
                description={page.meta_description || ''}
                url={`/${slug}`}
            />

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">
                    {page.title}
                </h1>

                <div
                    className="prose prose-lg max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </div>
        </div>
    );
};

export default DynamicPage;
