"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase/client';

export function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login?redirect=/admin');
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', session?.user.id)
        .single();

      if (!adminUser) {
        router.push('/');
        return;
      }

      setIsLoading(false);
    };

    checkAdminAccess();
  }, [router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}