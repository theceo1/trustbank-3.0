"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { getWalletService } from '@/app/lib/services/quidax-wallet';
import { formatCurrency } from '@/lib/utils';

interface WalletBalance {
  currency: string;
  balance: string;
  locked: string;
  total: string;
}

export function WalletOverview() {
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        setError(null);
        const walletService = getWalletService();
        const data = await walletService.getAllWallets();
        setWallets(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch wallet balances');
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWallets, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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
      ) : (
        // Actual wallet cards
        wallets.map((wallet) => (
          <Card key={wallet.currency} className="relative overflow-hidden">
            <CardHeader className="space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {wallet.currency.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(parseFloat(wallet.total), wallet.currency)}
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div>Available: {formatCurrency(parseFloat(wallet.balance), wallet.currency)}</div>
                {parseFloat(wallet.locked) > 0 && (
                  <div>Locked: {formatCurrency(parseFloat(wallet.locked), wallet.currency)}</div>
                )}
              </div>
            </CardContent>
            {/* Gradient overlay for visual appeal */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/5" />
          </Card>
        ))
      )}
    </div>
  );
} 