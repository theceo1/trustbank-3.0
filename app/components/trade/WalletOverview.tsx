"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { QuidaxWalletService } from '../../lib/services/quidax-wallet';
import { useToast } from '../../hooks/use-toast';

interface Balance {
  currency: string;
  balance: string;
  locked: string;
}

const SUPPORTED_CURRENCIES = ['BTC', 'ETH', 'USDT', 'LTC'];

export default function WalletOverview() {
  const { data: session } = useSession();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!session?.user?.id) {
        throw new Error('Please sign in to view your wallet.');
      }

      // Get user's Quidax ID from profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('quidax_id, kyc_status')
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      if (!profile?.quidax_id) {
        console.error('No Quidax ID found for user:', session.user.id);
        throw new Error('Quidax account not found');
      }

      if (profile.kyc_status !== 'verified') {
        throw new Error('Please complete KYC verification to access your wallet');
      }

      console.log('Fetching wallets for Quidax ID:', profile.quidax_id);
      const walletService = QuidaxWalletService.getInstance();
      if (session.user.token) {
        console.log('Setting token for wallet service');
        walletService.setToken(session.user.token);
      } else {
        console.warn('No token available in session');
      }
      
      const response = await walletService.getAllWallets(profile.quidax_id);
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        console.log('Wallet data:', response.data);
        setBalances(response.data
          .filter(wallet => SUPPORTED_CURRENCIES.includes(wallet.currency.toUpperCase()))
          .map(wallet => ({
            currency: wallet.currency,
            balance: wallet.balance,
            locked: wallet.locked
          })));
      } else {
        console.error('Invalid wallet data:', response);
        throw new Error('Invalid wallet data received');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch wallet data';
      console.error('Wallet fetch error:', err);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchWallets();
    }
  }, [session?.user?.id]);

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground text-center">
            Please sign in to view your wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Wallet Overview
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWallets}
          className="h-8 w-8 p-0"
          title="Refresh"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWallets}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : balances.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No wallet data available
          </p>
        ) : (
          <div className="space-y-4">
            {balances.map((balance) => (
              <div
                key={balance.currency}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{balance.currency.toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(parseFloat(balance.balance), balance.currency)}
                  </p>
                  {parseFloat(balance.locked) > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(parseFloat(balance.locked), balance.currency)} locked
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 