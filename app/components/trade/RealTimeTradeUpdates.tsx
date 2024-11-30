import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase/client';

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
        (payload) => {
          const newStatus = payload.new.status;
          onUpdate(newStatus);

          // Show toast notification based on status
          if (newStatus === 'completed') {
            toast({
              id: "trade-completed",
              title: 'Trade Completed',
              description: 'Your trade has been processed successfully',
            });
          } else if (newStatus === 'failed') {
            toast({
              id: "trade-failed",
              title: 'Trade Failed',
              description: 'There was an issue processing your trade',
              variant: 'destructive',
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