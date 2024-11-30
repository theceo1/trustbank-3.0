import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import supabase from '@/lib/supabase/client';
import { Transaction } from '@/app/types/transactions';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/app/hooks/useWallet';

export function useRealtimeTransactions(userId: string | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { refreshWallet } = useWallet();

  useEffect(() => {
    let channel: RealtimeChannel;

    const fetchInitialTransactions = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          id: "fetch-transactions-error",
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const setupRealtimeSubscription = () => {
      if (!userId) return;

      channel = supabase
        .channel(`transactions:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`
          },
          async (payload) => {
            console.log('Realtime update:', payload);

            // Refresh wallet balance
            await refreshWallet();

            // Handle different database events
            switch (payload.eventType) {
              case 'INSERT':
                setTransactions(prev => [payload.new as Transaction, ...prev]);
                toast({
                  id: "new-transaction",
                  title: "New Transaction",
                  description: `${payload.new.type} of ${payload.new.currency} ${payload.new.amount} initiated`,
                });
                break;

              case 'UPDATE':
                setTransactions(prev =>
                  prev.map(tx =>
                    tx.id === payload.new.id ? { ...tx, ...payload.new } : tx
                  )
                );
                if (payload.new.status === 'completed') {
                  toast({
                    id: "transaction-completed",
                    title: "Transaction Completed",
                    description: `Your ${payload.new.type} has been completed successfully`,
                  });
                } else if (payload.new.status === 'failed') {
                  toast({
                    id: "transaction-failed",
                    title: "Transaction Failed",
                    description: `Your ${payload.new.type} could not be completed`,
                    variant: "destructive",
                  });
                }
                break;

              case 'DELETE':
                setTransactions(prev =>
                  prev.filter(tx => tx.id !== payload.old.id)
                );
                break;
            }
          }
        )
        .subscribe();
    };

    fetchInitialTransactions();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, toast, refreshWallet]);

  return { transactions, isLoading };
}