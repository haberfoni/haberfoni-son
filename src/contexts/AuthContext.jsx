import React, { createContext, useContext, useState, useEffect } from 'react';


const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = () => {
            const token = localStorage.getItem('local_admin_token');
            if (token) {
                const dummySessionUser = { id: 'admin-123', email: 'admin@local.com', role: 'admin' };
                setUser(dummySessionUser);
                loadProfile(dummySessionUser.id);
            } else {
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        };

        checkSession();

        // Listen for storage changes in case of multi-tab logout
        window.addEventListener('storage', checkSession);
        return () => window.removeEventListener('storage', checkSession);
    }, []);

    const loadProfile = async (userId) => {
        try {
            // Fake profile load to match previous expected behavior
            setProfile({ id: 'admin-123', role: 'admin', full_name: 'Yerel Admin', email: 'admin@local.com' });
        } catch (error) {
            console.error('Error loading profile:', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email, password) => {
    };

    const signOut = async () => {
        localStorage.removeItem('local_admin_token');
        setUser(null);
        setProfile(null);
        setTimeout(() => window.location.href = '/', 200);
    };

    const isAdmin = profile?.role === 'admin';

    const value = {
        user,
        profile,
        loading,
        isAdmin,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
