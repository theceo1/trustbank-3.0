// context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import supabase from '@/lib/supabase/client';
import { KYCInfo } from '@/app/types/kyc';
import { useRouter } from 'next/navigation';
import { refreshSession } from '@/app/lib/auth/sessionRefresh';
import { clearAuthData } from '@/app/lib/auth/clearAuth';

export interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, metadata?: {
    name?: string;
    referralCode?: string;
    referredBy?: string | null;
  }) => Promise<{ user: User | null; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ data: { provider: string; url: string | null } | null; error: Error | null }>;
  loading: boolean;
  kycInfo?: KYCInfo;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [kycInfo, setKYCInfo] = useState<KYCInfo>();
  const router = useRouter();

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }
    return session.access_token;
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { session, error } = await refreshSession();
        if (error) throw error;
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      // Skip the user existence check and go straight to sign in
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { user: null, error: new Error('User not found or invalid password') };
        }
        throw error;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      
      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      clearAuthData();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signUp = async (email: string, password: string, metadata?: {
    name?: string;
    referralCode?: string;
    referredBy?: string | null;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata
        }
      });
      
      if (error) throw error;
      return { user: data.user, error: null };
    } catch (error) {
      console.error('SignUp error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error : new Error('Failed to sign up') 
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      return { 
        data: data ? { 
          provider: 'google', 
          url: data.url || null 
        } : null, 
        error: null 
      };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Failed to sign in with Google') 
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      kycInfo,
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
      getToken
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};