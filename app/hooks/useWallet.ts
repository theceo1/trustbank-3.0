import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import supabase from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
  total_deposits?: number;
  total_withdrawals?: number;
}

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (walletError) {
        if (walletError.code === 'PGRST116') {
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert([{
              user_id: user.id,
              balance: 0,
              pending_balance: 0,
              currency: 'NGN'
            }])
            .select()
            .single();

          if (createError) throw createError;
          setWallet(newWallet);
        } else {
          throw walletError;
        }
      } else {
        setWallet(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch wallet'));
      console.error('Error fetching wallet:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let channel: RealtimeChannel;

    const setupRealtimeSubscription = () => {
      if (!user) return;

      channel = supabase
        .channel(`wallets:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'wallets',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Wallet update:', payload);
            setWallet(payload.new as Wallet);
          }
        )
        .subscribe();
    };

    fetchWallet();
    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, fetchWallet]);

  return { 
    wallet, 
    isLoading, 
    error, 
    refreshWallet: fetchWallet 
  };
}