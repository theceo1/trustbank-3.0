//app/trade/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import MarketStats from '@/app/components/trade/MarketStats';
import TradeForm from '@/app/components/trade/TradeForm';
import WalletOverview from '@/app/components/trade/WalletOverview';

export default function TradePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      toast.error('Please sign in to access the trading page');
      router.push('/auth/login?redirect=/trade');
      return;
    }

    // Check if user has trading access
    const hasTradeAccess = session.user?.role === 'admin' || session.user?.role === 'trader';
    if (!hasTradeAccess) {
      toast.error('You do not have access to the trading feature');
      router.push('/dashboard');
      return;
    }

    setIsLoading(false);
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[1fr,300px]">
        <div className="space-y-6">
          <MarketStats />
          <TradeForm />
        </div>
        <div>
          <WalletOverview />
        </div>
      </div>
    </div>
  );
}