import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../context/SiteSettingsContext';

const SEO = ({ title, description, image, url, type = 'website', publishedTime, modifiedTime, author, tags, noIndex = false }) => {
    const { settings } = useSiteSettings();
    const location = useLocation();
    const isHome = location.pathname === '/';

    const siteTitle = settings?.site_title || 'Haberfoni';
    const siteUrl = 'https://haberfoni.com';
    const defaultImage = `${siteUrl}/images/slider_economy.png`;

    // Logic: Use provided description. 
    // If missing, fallback to site description or title to ensure tag is never empty.
    const metaDescription = description || settings?.site_description || title || 'Haberfoni güncel haberler';

    // Derived values
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaImage = image || defaultImage;

    // URL Logic: Use provided URL prop > Current Location > Site URL
    const currentPath = location.pathname + location.search;
    const fallbackUrl = `${siteUrl}${currentPath}`;
    const fullUrl = url ? (url.startsWith('http') ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`) : fallbackUrl;

    console.log('%c SEO DATA ', 'background: #007bff; color: white; padding: 2px 5px; border-radius: 2px;', {
        Title: fullTitle,
        Description: metaDescription,
        Canonical: fullUrl,
        Robots: noIndex ? "noindex, nofollow" : "index, follow",
        Keywords: tags ? tags.join(', ') : 'None'
    });

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

    // Robots Logic: If noIndex is true or site settings demand it (future proofing), use noindex.
    // Otherwise use default index, follow.
    const robotsContent = noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

    return (
        <Helmet>
            {/* Standard Metadata */}
            <meta name="description" content={metaDescription} key="description" />
            <title>{fullTitle}</title>
            {settings?.favicon && <link rel="icon" href={settings.favicon} />}
            <link rel="canonical" href={fullUrl} key="canonical" />
            <meta name="robots" content={robotsContent} key="robots" />
            {tags && tags.length > 0 && (
                <meta name="keywords" content={tags.join(', ')} key="keywords" />
            )}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title || siteTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:site_name" content={siteTitle} />
            <meta property="og:locale" content="tr_TR" />
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {tags && tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@haberfoni" />
            <meta name="twitter:creator" content="@haberfoni" />
            <meta name="twitter:title" content={title || siteTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />

            {/* Dynamic Scripts from Settings */}

            {/* Google Analytics */}
            {settings?.google_analytics_id && (
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} />
            )}
            {settings?.google_analytics_id && (
                <script>
                    {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${settings.google_analytics_id}');
                    `}
                </script>
            )}

            {/* Google Adsense */}
            {settings?.google_adsense_id && (
                <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.google_adsense_id}`}
                    crossOrigin="anonymous"></script>
            )}

            {/* Yandex Metrica */}
            {settings?.yandex_metrica_id && (
                <script type="text/javascript" >
                    {`
                   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                   m[i].l=1*new Date();
                   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
                   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

                   ym(${settings.yandex_metrica_id}, "init", {
                        clickmap:true,
                        trackLinks:true,
                        accurateTrackBounce:true,
                        webvisor:true
                   });
                   `}
                </script>
            )}

            {/* Google Search Console Verification */}
            {settings?.google_search_console_id && (
                <div dangerouslySetInnerHTML={{ __html: settings.google_search_console_id }} />
            )}

            {/* Google News / Discover Specifics */}
            {/* Google News / Discover Specifics - Handled in robots meta above */}

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
