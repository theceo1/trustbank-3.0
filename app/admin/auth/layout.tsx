"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/app/admin/context/AdminAuthContext';
import { toast } from 'sonner';

export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not an admin, redirect to regular login
    if (user && !user.app_metadata?.is_admin) {
      toast.error('Access denied. Please use the regular login page.');
      router.push('/auth/login');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
} 