"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getWalletService } from '@/lib/services/quidax-wallet';
import { formatCurrency } from '@/lib/utils';

interface WalletBalance {
  currency: string;
  balance: string;
  locked: string;
}

export default function WalletOverview() {
  const { data: session } = useSession();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchWallets();
    }
  }, [session]);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const walletService = getWalletService();
      const response = await walletService.getAllWallets();
      
      if (response.status === 'success' && Array.isArray(response.data)) {
        setBalances(response.data.map(wallet => ({
          currency: wallet.currency,
          balance: wallet.balance,
          locked: wallet.locked
        })));
      } else {
        throw new Error('Invalid wallet data received');
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      setError('Failed to load wallet balances. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Please sign in to view your wallet balances
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : balances.length === 0 ? (
          <div className="text-sm text-muted-foreground">No balances found</div>
        ) : (
          <div className="space-y-4">
            {balances.map((balance) => (
              <div
                key={balance.currency}
                className="flex items-center justify-between"
              >
                <div className="font-medium">{balance.currency}</div>
                <div className="space-y-1 text-right">
                  <div>{formatCurrency(parseFloat(balance.balance), balance.currency)}</div>
                  {parseFloat(balance.locked) > 0 && (
                    <div className="text-xs text-muted-foreground">
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