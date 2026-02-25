import React, { createContext, useContext, useEffect, useState } from 'react';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = () => {
            const token = localStorage.getItem('local_admin_token');
            if (token) {
                const dummySessionUser = { id: 'admin-123', email: 'admin@local.com', role: 'admin' };
                setSession({ user: dummySessionUser });
                setUser(dummySessionUser);
                loadProfile(dummySessionUser.id);
            } else {
                setSession(null);
                setUser(null);
                setProfile(null);
                setLoading(false);
            }
        };

        checkSession();
        window.addEventListener('storage', checkSession);
        return () => window.removeEventListener('storage', checkSession);
    }, []);

    const loadProfile = async (userId) => {
        try {
            console.log('🔍 Loading profile for user:', userId);
            const data = { id: 'admin-123', role: 'admin', full_name: 'Yerel Admin', email: 'admin@local.com' };
            console.log('✅ Profile loaded:', data);
            setProfile(data);
        } catch (error) {
            console.error('❌ Error loading profile:', error);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const signOut = () => {
        localStorage.removeItem('local_admin_token');
        setProfile(null);
        setUser(null);
        setSession(null);
        setTimeout(() => window.location.href = '/', 200);
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
            localStorage.setItem('local_admin_token', 'true');
            setTimeout(() => window.location.reload(), 200);
            return { data: { user: { id: 'admin-123' } }, error: null };
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
