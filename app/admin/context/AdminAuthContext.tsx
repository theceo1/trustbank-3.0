// app/admin/context/AdminAuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

// Update interface to match the database structure
interface AdminRole {
  name: string;
  permissions: Record<string, string[]>;
}

interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  is_active: boolean;
}

interface AdminRoleData {
  name: string;
  permissions: Record<string, string[]>;
}

interface AdminDataResponse {
  id: string;
  user_id: string;
  is_active: boolean;
  role: AdminRoleData[] | AdminRoleData | null;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  adminUser: AdminUser | null;
  hasPermission: (resource: string, action: string) => boolean;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isLoading: true,
  adminUser: null,
  hasPermission: () => false,
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsAdmin(false);
      setAdminUser(null);
      router.push('/auth/login');
    }
  };

  const hasPermission = (resource: string, action: string) => {
    if (!adminUser?.role?.permissions) return false;
    const permissions = adminUser.role.permissions[resource];
    return permissions?.includes(action) || false;
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setAdminUser(null);
          setIsLoading(false);
          return;
        }

        // First check admin_access_cache
        const { data: accessData, error: accessError } = await supabase
          .from('admin_access_cache')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();

        if (!accessError && accessData?.is_admin) {
          // If cached as admin, get full admin details
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select(`
              id,
              user_id,
              is_active,
              role:admin_roles (
                name,
                permissions
              )
            `)
            .eq('user_id', session.user.id)
            .single() as { data: AdminDataResponse | null, error: any };

          if (!adminError && adminData && adminData.is_active) {
            // Fix: Handle the role data structure correctly
            const roleData: AdminRole = Array.isArray(adminData.role) 
              ? {
                  name: adminData.role[0]?.name || '',
                  permissions: adminData.role[0]?.permissions || {}
                }
              : adminData.role 
                ? {
                    name: adminData.role.name || '',
                    permissions: adminData.role.permissions || {}
                  }
                : {
                    name: '',
                    permissions: {}
                  };
            
            setIsAdmin(true);
            setAdminUser({
              id: adminData.id,
              user_id: adminData.user_id,
              is_active: adminData.is_active,
              role: roleData
            });
            
            if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
              router.push('/admin/dashboard');
            }
            return;
          }
        }

        setIsAdmin(false);
        setAdminUser(null);
      } catch (error) {
        console.error('Admin check error:', error);
        setIsAdmin(false);
        setAdminUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, adminUser, hasPermission, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);