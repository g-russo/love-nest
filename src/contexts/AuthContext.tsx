'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, clearAuthToken } from '@/lib/api';

interface User {
    _id: string;
    email: string;
    displayName: string;
    nickname?: string;
    avatar?: string;
    birthday?: string;
    isLinked: boolean;
    coupleId?: any;
}

interface Partner {
    _id: string;
    displayName: string;
    email: string;
    avatar?: string;
    nickname?: string;
}

interface AuthContextType {
    user: User | null;
    partner: Partner | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; displayName: string; nickname?: string; birthday?: string }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const data: any = await api.getMe();
            setUser(data.user);
            setPartner(data.partner || null);
        } catch (error) {
            // Only clear user state, don't clear token (might just be network error)
            setUser(null);
            setPartner(null);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            // Check if we have a token stored
            const token = typeof window !== 'undefined' ? localStorage.getItem('lovenest_token') : null;

            if (token) {
                try {
                    await refreshUser();
                } catch (error) {
                    // Token is invalid, clear it
                    clearAuthToken();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const data: any = await api.login({ email, password });
        setUser(data.user);
        // Token is automatically stored by api.ts
        await refreshUser();
    };

    const register = async (data: { email: string; password: string; displayName: string; nickname?: string; birthday?: string }) => {
        const response: any = await api.register(data);
        setUser(response.user);
        // Token is automatically stored by api.ts
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            // Ignore logout errors
        }
        clearAuthToken();
        setUser(null);
        setPartner(null);
    };

    return (
        <AuthContext.Provider value={{ user, partner, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
