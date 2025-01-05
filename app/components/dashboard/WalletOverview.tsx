"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WalletBalance {
  currency: string;
  balance: number;
  locked: number;
  total: number;
}

export function WalletOverview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallets = async () => {
      if (!user?.id) {
        setError('Please sign in to view your wallet balances');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/wallet/${user.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch wallets');
        }

        const data = await response.json();
        if (data.status !== 'success' || !Array.isArray(data.data)) {
          throw new Error('Invalid wallet data received');
        }

        setWallets(data.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching wallets:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch wallets');
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to fetch wallets',
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWallets, 30000);
    return () => clearInterval(interval);
  }, [user?.id, toast]);

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
                {wallet.currency}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(wallet.balance, wallet.currency)}
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div>Available: {formatCurrency(wallet.balance, wallet.currency)}</div>
                {wallet.locked > 0 && (
                  <div>Locked: {formatCurrency(wallet.locked, wallet.currency)}</div>
                )}
                <div>Total: {formatCurrency(wallet.total, wallet.currency)}</div>
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