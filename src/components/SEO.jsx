import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website', publishedTime, modifiedTime, author, tags }) => {
    const siteTitle = 'Haberfoni';
    const siteUrl = 'https://haberfoni.com'; // Replace with actual domain
    const defaultImage = `${siteUrl}/images/slider_economy.png`; // Replace with actual default image

    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    const metaImage = image || defaultImage;

    // Structured Data for NewsArticle
    const structuredData = type === 'article' ? {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": title,
        "image": [metaImage],
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "author": [{
            "@type": "Person",
            "name": author || "Haberfoni Editörü",
            "url": `${siteUrl}/yazar/${author?.toLowerCase().replace(/ /g, '-')}`
        }],
        "publisher": {
            "@type": "Organization",
            "name": siteTitle,
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.png`
            }
        },
        "description": description
    } : null;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:site_name" content={siteTitle} />
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {tags && tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title || siteTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={metaImage} />

            {/* Google News / Discover Specifics */}
            <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

            {/* Structured Data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
