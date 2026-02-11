import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { fetchCategories } from '../services/api';

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({});
    const [ads, setAds] = useState([]);
    const [redirects, setRedirects] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load settings, ads, redirects, and categories in parallel
            const [settingsData, adsData, redirectsData, categoriesData] = await Promise.all([
                adminService.getSettings(),
                adminService.getAdPlacements(),
                adminService.getRedirects(),
                fetchCategories()
            ]);

            setSettings(settingsData);
            setAds(adsData);
            setRedirects(redirectsData);
            setCategories(categoriesData);

        } catch (error) {
            console.error('Error loading site data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SiteSettingsContext.Provider value={{ settings, ads, redirects, categories, loading, reloadSettings: loadData }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => {
    return useContext(SiteSettingsContext);
};
