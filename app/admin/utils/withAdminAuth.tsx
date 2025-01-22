"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const { data: { user } } = await getSupabaseClient().auth.getUser();
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: profile } = await getSupabaseClient()
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

export default function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAdminAuthComponent(props: P) {
    return (
      <AdminAuthWrapper>
        <WrappedComponent {...props} />
      </AdminAuthWrapper>
    );
  };
}