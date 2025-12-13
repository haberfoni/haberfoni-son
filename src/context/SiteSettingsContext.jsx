import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [ads, setAds] = useState([]);
    const [redirects, setRedirects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load settings, ads, and redirects in parallel
            const [settingsData, adsData, redirectsData] = await Promise.all([
                adminService.getSettings(),
                adminService.getAdPlacements(),
                adminService.getRedirects()
            ]);

            setSettings(settingsData);
            setAds(adsData);
            setRedirects(redirectsData);

        } catch (error) {
            console.error('Error loading site data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SiteSettingsContext.Provider value={{ settings, ads, redirects, loading, reloadSettings: loadData }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => {
    return useContext(SiteSettingsContext);
};
