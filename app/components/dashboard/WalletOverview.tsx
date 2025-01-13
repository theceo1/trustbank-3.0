"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WalletBalance {
  id: string;
  name: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  blockchain_enabled: boolean;
  default_network: string | null;
  networks: {
    id: string;
    name: string;
    deposits_enabled: boolean;
    withdraws_enabled: boolean;
  }[];
}

interface ApiResponse {
  status: string;
  message: string;
  data: WalletBalance[];
}

export function WalletOverview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = async () => {
    if (!user?.id) {
      setError('Please sign in to view your wallet balances');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/wallet/balances');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch wallets' }));
        console.error('Wallet fetch error:', errorData);
        throw new Error(errorData.error || `Failed to fetch wallets: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      if (!data.status || !data.data || !Array.isArray(data.data)) {
        console.error('Invalid wallet data:', data);
        throw new Error('Invalid wallet data received');
      }

      // Filter out wallets with zero balance for cleaner UI
      const nonZeroWallets = data.data.filter(wallet => 
        parseFloat(wallet.balance) > 0 || parseFloat(wallet.locked) > 0 || parseFloat(wallet.staked) > 0
      );
      setWallets(nonZeroWallets);
      setError(null);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch wallets';
      setError(errorMessage);
      toast({
        title: "Wallet Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoize fetchWallets to prevent infinite re-renders
  const memoizedFetchWallets = useCallback(fetchWallets, [user?.id, toast]);

  useEffect(() => {
    memoizedFetchWallets();
    // Refresh every 30 seconds
    const interval = setInterval(memoizedFetchWallets, 30000);
    return () => clearInterval(interval);
  }, [memoizedFetchWallets]);

  if (error) {
    return (
      <Card className="p-6">
        <Alert variant="destructive" className="mb-4">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Failed to Load Wallets</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              memoizedFetchWallets();
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {loading ? (
        // Loading skeletons
        Array(6).fill(0).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-36" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : wallets.length === 0 ? (
        <Alert>
          <AlertTitle>No Wallets Found</AlertTitle>
          <AlertDescription>
            No wallet information is available at this time.
          </AlertDescription>
        </Alert>
      ) : (
        // Actual wallet cards
        wallets.map((wallet) => (
          <Card key={wallet.currency} className="relative overflow-hidden">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {wallet.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(parseFloat(wallet.balance), wallet.currency)}
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div>Available: {formatCurrency(parseFloat(wallet.balance), wallet.currency)}</div>
                {parseFloat(wallet.locked) > 0 && (
                  <div>Locked: {formatCurrency(parseFloat(wallet.locked), wallet.currency)}</div>
                )}
                {parseFloat(wallet.staked) > 0 && (
                  <div>Staked: {formatCurrency(parseFloat(wallet.staked), wallet.currency)}</div>
                )}
                {wallet.converted_balance && wallet.reference_currency && (
                  <div>≈ {formatCurrency(parseFloat(wallet.converted_balance), wallet.reference_currency)}</div>
                )}
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/5" />
          </Card>
        ))
      )}
    </div>
  );
} 