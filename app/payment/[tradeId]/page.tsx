//app/payment/[tradeId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PaymentProcessor } from '@/app/trade/components/PaymentProcessor';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { useToast } from '@/hooks/use-toast';
import { TradeDetails } from '@/app/types/trade';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [trade, setTrade] = useState<TradeDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrade = async () => {
      try {
        const tradeData = await UnifiedTradeService.getTrade(params.tradeId as string);
        setTrade(tradeData);
      } catch (error) {
        toast({
          id: 'trade-error',
          title: 'Error',
          description: 'Failed to load trade details',
          variant: 'destructive',
        });
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchTrade();
  }, [params.tradeId, router, toast]);

  const handlePaymentComplete = () => {
    router.push(`/dashboard/trades/${params.tradeId}`);
  };

  if (loading || !trade) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <PaymentProcessor 
        trade={trade} 
        onComplete={handlePaymentComplete} 
      />
    </div>
  );
}