"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/app/context/AuthContext';
import { QuidaxWalletService } from '@/app/lib/services/quidax-wallet';
import { Card, CardContent } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { AlertCircle, LinkIcon } from 'lucide-react';
import Link from 'next/link';

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

interface ErrorState {
  message: string;
  type: 'setup' | 'kyc' | 'general';
  redirectTo?: string;
}

const SUPPORTED_CURRENCY_SYMBOLS = ['USDT', 'NGN'];

export default function WalletOverview() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  const fetchWallets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/wallet/balances');
      const data = await response.json();

      if (!response.ok) {
        if (data.redirectTo === '/profile/verification') {
          setError({
            message: data.message || 'Please complete your identity verification to access your wallet.',
            type: 'kyc'
          });
        } else {
          throw new Error(data.message || 'Failed to fetch wallet balances');
        }
        return;
      }

      if (data.status === 'success' && Array.isArray(data.data)) {
        setBalances(data.data.map((wallet: any) => ({
          currency: wallet.currency,
          balance: (wallet.balance ?? 0).toString(),
          locked: (wallet.locked ?? 0).toString()
        })));
      } else {
        console.error('Invalid wallet data:', data);
        throw new Error('Unable to load wallet information. Please try again.');
      }
    } catch (error: any) {
      console.error('Wallet fetch error:', error);
      setError({
        message: error.message,
        type: 'general'
      });
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
          <Alert variant={error.type === 'general' ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>{error.message}</p>
              {error.redirectTo && (
                <Link 
                  href={error.redirectTo} 
                  className="flex items-center text-primary hover:underline mt-2"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  {error.type === 'kyc' ? 'Complete Identity Verification' : 'Complete Wallet Setup'}
                </Link>
              )}
            </AlertDescription>
          </Alert>
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