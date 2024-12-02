// app/admin/context/AdminAuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

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
          router.push('/auth/login?redirect=/admin/dashboard');
          return;
        }

        // First check cache
        const { data: cacheData } = await supabase
          .from('admin_access_cache')
          .select('is_admin, permissions')
          .eq('user_id', session.user.id)
          .single();

        if (cacheData?.is_admin) {
          const { data: adminData } = await supabase
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
            .single();

          if (adminData?.is_active) {
            const roleData = Array.isArray(adminData.role) 
              ? adminData.role[0] 
              : adminData.role;

            if (roleData) {
              setIsAdmin(true);
              setAdminUser({
                id: adminData.id,
                user_id: adminData.user_id,
                is_active: adminData.is_active,
                role: {
                  name: roleData.name,
                  permissions: roleData.permissions
                }
              });
              
              if (window.location.pathname === '/auth/login' || window.location.pathname === '/dashboard') {
                router.push('/admin/dashboard');
              }
              return;
            }
          }
        }

        // If not admin, redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Admin check error:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, adminUser, hasPermission, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);