//app/components/dashboard/AccountBalance
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Balance {
  currency: string;
  balance: number;
}

export function AccountBalance() {
  const { toast } = useToast();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      setError(null);
      setErrorMessage(null);
      setRedirectTo(null);
      const response = await fetch('/api/wallet/balances');
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 && errorData.redirectTo) {
          setRedirectTo(errorData.redirectTo);
          setErrorMessage(errorData.message);
        }
        throw new Error(errorData?.error || 'Failed to fetch balance');
      }

      const data = await response.json();
      setBalances(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      console.error('Error fetching balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error === 'KYC verification required' && errorMessage && redirectTo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {errorMessage}
              <Link href={redirectTo} className="flex items-center mt-2 text-primary hover:underline">
                <LinkIcon className="h-4 w-4 mr-1" />
                Complete KYC
              </Link>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error === 'Quidax account not linked') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please link your Quidax account to view your balance.
              <Link href="/settings/integrations" className="flex items-center mt-2 text-primary hover:underline">
                <LinkIcon className="h-4 w-4 mr-1" />
                Link Account
              </Link>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {balances.length === 0 ? (
            <p className="text-muted-foreground">No balances to display</p>
          ) : (
            balances.map((balance) => (
              <div key={balance.currency} className="flex justify-between items-center">
                <span className="font-medium">{balance.currency.toUpperCase()}</span>
                <span>{balance.balance.toLocaleString()}</span>
              </div>
            ))
          )}
          <div className="flex justify-end mt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/wallet">
                View Wallet
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
