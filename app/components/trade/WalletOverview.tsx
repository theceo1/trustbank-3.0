"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/app/context/AuthContext';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';
import { Card, CardContent } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { toast } from 'sonner';

interface WalletBalance {
  currency: string;
  balance: string;
  locked: string;
}

interface QuidaxWallet {
  currency: string;
  balance: number | string;
  locked: number | string;
}

const SUPPORTED_CURRENCY_SYMBOLS = ['USDT', 'NGN'];

export default function WalletOverview() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('Please sign in to view your wallet.');
      }

      // Get user's Quidax ID from profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('quidax_id, kyc_status')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Unable to load wallet information. Please try again.');
      }

      if (!profile?.quidax_id) {
        console.error('No Quidax ID found for user:', user.id);
        throw new Error('Your wallet is not yet set up. Please complete your profile setup.');
      }

      // Fetch balances from the balances endpoint
      const response = await fetch('/api/wallet/balances');
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Unable to load wallet information. Please try again.');
      }

      if (data.status === 'success' && Array.isArray(data.data)) {
        setBalances(data.data
          .filter((wallet: QuidaxWallet) => SUPPORTED_CURRENCY_SYMBOLS.includes(wallet.currency.toUpperCase()))
          .map((wallet: QuidaxWallet) => ({
            currency: wallet.currency,
            balance: wallet.balance.toString(),
            locked: wallet.locked.toString()
          })));
      } else {
        console.error('Invalid wallet data:', data);
        throw new Error('Unable to load wallet information. Please try again.');
      }
    } catch (error: any) {
      console.error('Wallet fetch error:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWallets();
    }
  }, [user]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {balances.map((balance) => (
            <div key={balance.currency} className="flex justify-between">
              <span className="text-sm font-medium">{balance.currency}</span>
              <span className="text-sm">
                {parseFloat(balance.balance).toFixed(2)}
                {parseFloat(balance.locked) > 0 && (
                  <span className="text-gray-500 ml-1">
                    ({parseFloat(balance.locked).toFixed(2)} locked)
                  </span>
                )}
              </span>
            </div>
          ))}
          {balances.length === 0 && (
            <div className="text-sm text-gray-500">No balances to display</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 