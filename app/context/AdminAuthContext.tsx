"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { AdminService } from '@/app/lib/services/admin';

interface AdminAuthContextType {
  isAdmin: boolean;
  permissions: Record<string, any>;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAdmin: false,
  permissions: {},
  isLoading: true,
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setPermissions({});
        setIsLoading(false);
        return;
      }

      try {
        const { isAdmin: adminStatus, permissions: adminPermissions } = 
          await AdminService.checkAdminAccess(user.id);
        
        setIsAdmin(adminStatus);
        setPermissions(adminPermissions);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setPermissions({});
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, permissions, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext); 