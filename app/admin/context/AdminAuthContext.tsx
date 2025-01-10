// app/admin/context/AdminAuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AdminService } from '@/app/lib/services/admin';
import { AuthSession, Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ user: null, error: null }),
  signOut: async () => {},
  hasPermission: () => false
});

// Export both names for backward compatibility
export const AdminProvider = AdminAuthProvider;
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();
  const adminService = AdminService.getInstance();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: AuthSession | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await checkAdminStatus(currentUser.id);
      } else {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const isAdminUser = await adminService.checkAdminAccess(userId);
      setIsAdmin(isAdminUser);
      if (!isAdminUser) {
        toast.error('Access denied. This area is for administrators only.');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ user: User | null; error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user returned from sign in');

      const isAdminUser = await adminService.checkAdminAccess(data.user.id);
      if (!isAdminUser) {
        throw new Error('Access denied. This area is for administrators only.');
      }

      return { user: data.user, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      toast.error(errorMessage);
      return { user: null, error: error instanceof Error ? error : new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!isAdmin) return false;
    // For now, if they're an admin, they have all permissions
    // TODO: Implement more granular permission checks based on admin roles
    return true;
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, isLoading, signIn, signOut, hasPermission }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};