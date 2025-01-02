// app/admin/context/AdminAuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabaseClient from '@/app/lib/supabase/client';
import { toast } from 'sonner';
import { AdminService } from '@/app/lib/services/admin';

interface AdminAuthContextType {
  user: any;
  signIn: (email: string, password: string) => Promise<{ user: any; error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  hasPermission: (resource: string, action: string) => boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and set the user
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          if (!session.user.app_metadata?.is_admin) {
            toast.error('Access denied. This area is for administrators only.');
            router.push('/auth/login');
            return;
          }
          setUser(session.user);
          setIsAdmin(true);
          
          // Fetch admin permissions
          const { permissions: adminPermissions } = await AdminService.checkAdminAccess(session.user.id);
          setPermissions(adminPermissions);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (!session.user.app_metadata?.is_admin) {
          toast.error('Access denied. This area is for administrators only.');
          router.push('/auth/login');
          return;
        }
        setUser(session.user);
        setIsAdmin(true);
        
        // Fetch admin permissions
        const { permissions: adminPermissions } = await AdminService.checkAdminAccess(session.user.id);
        setPermissions(adminPermissions);
      } else {
        setUser(null);
        setPermissions({});
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user?.app_metadata?.is_admin) {
        throw new Error('Access denied. This area is for administrators only.');
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { user: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      router.push('/admin/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!permissions[resource]) return false;
    return permissions[resource].includes(action);
  };

  const value = {
    user,
    signIn,
    signOut,
    loading,
    hasPermission,
    isAdmin,
    isLoading: loading,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminProvider');
  }
  return context;
};