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
import { SUPPORTED_CURRENCY_SYMBOLS } from '@/app/lib/constants/crypto';

interface Balance {
  currency: string;
  balance: string;
  locked: string;
}

export default function WalletOverview() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

      const walletService = QuidaxWalletService.getInstance();
      const response = await walletService.getAllWallets(profile.quidax_id);
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        setBalances(response.data
          .filter(wallet => SUPPORTED_CURRENCY_SYMBOLS.includes(wallet.currency.toUpperCase()))
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
    fetchWallets();

    // Listen for balance update events
    const handleBalanceUpdate = () => {
      fetchWallets();
    };
    window.addEventListener('balanceUpdate', handleBalanceUpdate);

    return () => {
      window.removeEventListener('balanceUpdate', handleBalanceUpdate);
    };
  }, [session?.user?.id]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Wallet Overview
            <Button
              variant="outline"
              size="icon"
              onClick={fetchWallets}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Wallet Overview
          <Button
            variant="outline"
            size="icon"
            onClick={fetchWallets}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : balances.length === 0 ? (
          <p className="text-sm text-muted-foreground">No wallet balances found.</p>
        ) : (
          <div className="space-y-4">
            {balances.map((balance) => (
              <div key={balance.currency} className="flex justify-between items-center">
                <span className="font-medium">{balance.currency.toUpperCase()}</span>
                <div className="text-right">
                  <div>{formatCurrency(parseFloat(balance.balance), balance.currency)}</div>
                  {parseFloat(balance.locked) > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(parseFloat(balance.locked), balance.currency)} locked
                    </div>
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