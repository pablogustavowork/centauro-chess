
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../types';


interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user);
            setLoading(false);
        }).catch((err) => {
            console.error("Supabase auth error:", err);
            setLoading(false);
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        const timeoutId = setTimeout(() => {
            setLoading((currentLoading) => {
                if (currentLoading) {
                    return false;
                }
                return currentLoading;
            });
        }, 3000);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeoutId);
        }
    }, []);

    const fetchProfile = async (user: User) => {
        const newProfile: UserProfile = {
            name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Jugador',
            elo: 1500,
        };
        setProfile(newProfile);
    };

    const signInWithGoogle = async () => {
        // Keep for future use
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        if (error) console.error('Error logging in:', error.message);
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUpWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
