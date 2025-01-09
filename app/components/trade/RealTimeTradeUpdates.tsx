import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase/client';

interface TradePayload {
  new: {
    status: string;
  };
}

interface RealTimeTradeUpdatesProps {
  tradeId: string;
  onUpdate: (status: string) => void;
}

export function RealTimeTradeUpdates({ tradeId, onUpdate }: RealTimeTradeUpdatesProps) {
  const { toast } = useToast();

  useEffect(() => {
    const subscription = supabase
      .channel(`trade-${tradeId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trades',
          filter: `id=eq.${tradeId}`
        },
        (payload: TradePayload) => {
          const newStatus = payload.new.status;
          onUpdate(newStatus);

          // Show toast notification based on status
          if (newStatus === 'completed') {
            toast({
              title: 'Trade Completed',
              description: 'Your trade has been processed successfully'
            });
          } else if (newStatus === 'failed') {
            toast({
              title: 'Trade Failed',
              description: 'There was an issue processing your trade',
              variant: 'destructive'
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tradeId, onUpdate, toast]);

  return null;
}