"use client";

import { createContext, useContext, useEffect, useState } from 'react';
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

  const updateAuthState = async (newSession: Session | null) => {
    console.log('Updating auth state:', {
      hasSession: !!newSession,
      userId: newSession?.user?.id,
      email: newSession?.user?.email
    });
    
    if (newSession) {
      // Verify session is still valid
      const { data: { session: verifiedSession }, error } = await supabase.auth.getSession();
      if (error || !verifiedSession) {
        console.error('Session verification failed:', error);
        setSession(null);
        setUser(null);
        return;
      }
      setSession(verifiedSession);
      setUser(verifiedSession.user);
    } else {
      setSession(null);
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Initialize session on mount
    const initSession = async () => {
      try {
        console.log('Initializing session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (initialSession && mounted) {
          console.log('Found existing session:', {
            userId: initialSession.user.id,
            email: initialSession.user.email
          });
          await updateAuthState(initialSession);
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession: Session | null) => {
      console.log('Auth state changed:', {
        event,
        userId: currentSession?.user?.id,
        email: currentSession?.user?.email
      });

      if (!mounted) return;

      if (currentSession) {
        await updateAuthState(currentSession);
        
        if (event === 'SIGNED_IN') {
          console.log('User signed in, refreshing...');
          router.refresh();
        }
      } else {
        await updateAuthState(null);
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting...');
          router.refresh();
          router.push('/auth/login');
        }
      }
    });

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (data.session) {
        console.log('Sign in successful:', {
          userId: data.session.user.id,
          email: data.session.user.email
        });
        await updateAuthState(data.session);
        router.refresh();
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Initiating Google sign in...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
      }
    } catch (error) {
      console.error('Unexpected Google sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting sign out...');
      
      // First clear local state
      setUser(null);
      setSession(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return;
      }

      console.log('Sign out successful');
      
      // Force clear any remaining auth state
      await updateAuthState(null);
      
      // Clear any cached data
      router.refresh();
      
      // Redirect to login page
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

  console.log('Auth context state:', {
    hasUser: !!user,
    hasSession: !!session,
    loading,
    userId: user?.id,
    email: user?.email
  });

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