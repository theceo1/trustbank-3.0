"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: new Error('Not implemented') }),
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  const updateAuthState = useCallback(async (newSession: Session | null) => {
    if (newSession) {
      setSession(newSession);
      setUser(newSession.user);
    } else {
      setSession(null);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const handleAuthChange = useCallback(async (event: AuthChangeEvent, session: Session | null) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    if (event === 'SIGNED_OUT') {
      await updateAuthState(null);
      router.replace('/auth/login');
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await updateAuthState(session);
    } else if (event === 'USER_UPDATED') {
      await updateAuthState(session);
    }
  }, [updateAuthState, router]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        await updateAuthState(initialSession);

        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(handleAuthChange);
        subscription = sub;
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [supabase, updateAuthState, handleAuthChange]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.session) {
        await updateAuthState(data.session);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.hostname === 'localhost' 
            ? `${window.location.origin}/auth/callback`
            : `https://xkxihvafbyegowhryojd.supabase.co/auth/v1/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw error;
      }

      if (!data.url) {
        console.error('No OAuth URL returned');
        throw new Error('Failed to initiate Google sign in');
      }

      // Let Supabase handle the redirect
      window.location.href = data.url;
    } catch (error) {
      console.error('Unexpected Google sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return;
      }

      await updateAuthState(null);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    }
  };

  const contextValue = {
    user,
    session,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 