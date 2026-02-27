import React, { createContext, useContext, useEffect, useState } from 'react';
import { login } from '../services/api';
import apiClient from '../services/apiClient';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('local_admin_token');
            const savedProfile = localStorage.getItem('local_admin_profile');

            if (token && savedProfile) {
                try {
                    const parsedProfile = JSON.parse(savedProfile);
                    setProfile(parsedProfile);
                    setUser(parsedProfile);
                    setSession({ user: parsedProfile });
                } catch (e) {
                    console.error('Error parsing profile:', e);
                }
            }
            setLoading(false);
        };

        checkSession();
        window.addEventListener('storage', checkSession);
        return () => window.removeEventListener('storage', checkSession);
    }, []);

    const loadProfile = async (userId) => {
        // Since we get the profile during login, we might not need separate load
        setLoading(false);
    };

    const signOut = () => {
        localStorage.removeItem('local_admin_token');
        localStorage.removeItem('local_admin_profile');
        setProfile(null);
        setUser(null);
        setSession(null);
        setTimeout(() => window.location.href = '/admin/login', 200);
    };

    const isAdmin = profile?.role === 'admin';
    // Allow authors and editors to access the panel, but maybe restrict specific actions later
    const canAccessAdmin = profile?.role === 'admin' || profile?.role === 'author' || profile?.role === 'editor';

    const value = {
        session,
        user,
        profile,
        loading,
        isAdmin,
        canAccessAdmin,
        signOut,
        signIn: async (email, password) => {
            try {
                const data = await login(email, password);
                if (data && data.user) {
                    localStorage.setItem('local_admin_token', data.access_token || 'true');
                    localStorage.setItem('local_admin_profile', JSON.stringify(data.user));
                    setProfile(data.user);
                    setUser(data.user);
                    setSession({ user: data.user });
                    return { data: { user: data.user }, error: null };
                }
                return { data: null, error: { message: 'Giriş başarısız.' } };
            } catch (error) {
                return { data: null, error: error.response?.data || error };
            }
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
