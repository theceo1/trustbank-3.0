// app/admin/context/AdminAuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdminRole, AdminPermission } from '../types/admin';
import { Database } from '@/types/supabase';

type AdminProfileRow = Database['public']['Tables']['admin_profiles']['Row'];

interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  permissions: AdminPermission;
  is_active: boolean;
  last_active: string;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  adminUser: AdminUser | null;
  hasPermission: (resource: string, action: string) => boolean;
  refreshAdminStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  isLoading: true,
  adminUser: null,
  hasPermission: () => false,
  refreshAdminStatus: async () => {},
  logout: async () => {}
});

const RolePermissions: Record<AdminRole, AdminPermission> = {
  super_admin: {
    canManageUsers: true,
    canManageAdmins: true,
    canViewReports: true,
    canManageSettings: true,
    canHandleSupport: true,
    canViewTransactions: true,
    canManageReferrals: true
  },
  admin: {
    canManageUsers: true,
    canManageAdmins: false,
    canViewReports: true,
    canManageSettings: false,
    canHandleSupport: true,
    canViewTransactions: true,
    canManageReferrals: true
  },
  moderator: {
    canManageUsers: false,
    canManageAdmins: false,
    canViewReports: false,
    canManageSettings: false,
    canHandleSupport: true,
    canViewTransactions: true,
    canManageReferrals: false
  },
  support: {
    canManageUsers: false,
    canManageAdmins: false,
    canViewReports: false,
    canManageSettings: false,
    canHandleSupport: true,
    canViewTransactions: true,
    canManageReferrals: false
  }
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const refreshAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setAdminUser(null);
      if (!session) {
        setIsAdmin(false);
        setAdminUser(null);
        setIsLoading(false);
        router.push('/auth/login?redirect=/admin/dashboard');
        return;
      }

      const { data: adminData, error } = await supabase
        .from('admin_profiles')
        .select('id, user_id, role, is_active, last_active')
        .eq('user_id', session.user.id)
        .single();

      if (error || !adminData) {
        throw error || new Error('No admin data found');
      }

      if (adminData.is_active) {
        const adminUserData: AdminUser = {
          id: adminData.id,
          user_id: adminData.user_id,
          role: adminData.role as AdminRole,
          is_active: adminData.is_active,
          last_active: adminData.last_active,
          permissions: RolePermissions[adminData.role as AdminRole]
        };

        setIsAdmin(true);
        setAdminUser(adminUserData);

        // Update last active timestamp
        await supabase
          .from('admin_profiles')
          .update({
            last_active: new Date().toISOString()
          })
          .eq('user_id', session.user.id);

      } else {
        setIsAdmin(false);
        setAdminUser(null);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Admin check error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to verify admin status",
        variant: "destructive"
      });
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (resource: string, action: string) => {
    return adminUser?.permissions[resource] || false;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsAdmin(false);
      setAdminUser(null);
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    refreshAdminStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdmin, 
        isLoading, 
        adminUser, 
        hasPermission,
        refreshAdminStatus,
        logout 
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);