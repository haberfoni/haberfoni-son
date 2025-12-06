import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

const RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { redirects } = useSiteSettings();

    useEffect(() => {
        if (redirects && redirects.length > 0) {
            checkRedirect();
        }
    }, [location.pathname, redirects]);

    const checkRedirect = () => {
        const currentPath = location.pathname;

        const matchedRedirect = redirects.find(r => r.old_path === currentPath);

        if (matchedRedirect) {
            console.log(`Redirecting from ${matchedRedirect.old_path} to ${matchedRedirect.new_path}`);
            navigate(matchedRedirect.new_path, { replace: true });
        }
    };

    return null; // This component doesn't render anything
};

export default RedirectHandler;
