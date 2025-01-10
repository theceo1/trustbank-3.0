"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from 'react-hot-toast';

export const dynamic = 'force-dynamic';

export default function DepositPage() {
  const session = useSession();
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      toast.error('Please login to continue');
    }
  }, [session, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Deposit Funds</h1>
      {/* Add your deposit form or content here */}
    </div>
  );
} 