"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, History, ArrowDown, ArrowUp, Loader2, AlertCircle, LinkIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from 'next/link';

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
}

interface WalletData {
  currency: string;
  balance: string;
  available_balance: string;
  pending_balance: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'kyc' | 'setup' | 'general' | null>(null);

  useEffect(() => {
    if (!user) {
      setError('Please sign in to view your wallet.');
      setLoading(false);
      return;
    }

    const fetchWalletData = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType(null);
        
        const response = await fetch('/api/wallet');
        if (!response.ok) {
          const data = await response.json();
          
          if (data.kyc_required) {
            setErrorType('kyc');
            throw new Error(data.error || 'Please complete your identity verification to access your wallet.');
          }
          
          if (data.setup_required) {
            setErrorType('setup');
            throw new Error(data.error || 'Please complete your wallet setup.');
          }

          setErrorType('general');
          throw new Error(data.error || 'Unable to fetch wallet information');
        }
        
        const data = await response.json();
        if (!data.wallets || !Array.isArray(data.wallets)) {
          throw new Error('Unable to load wallet information. Please try again later.');
        }
        
        setWallets(data.wallets);
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError(err instanceof Error ? err.message : 'Unable to fetch wallet information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
    // Refresh wallet data every minute
    const interval = setInterval(fetchWalletData, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant={errorType === 'general' ? 'destructive' : 'default'}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {errorType === 'kyc' && 'Identity Verification Required'}
            {errorType === 'setup' && 'Wallet Setup Required'}
            {errorType === 'general' && 'Error'}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            {errorType === 'kyc' && (
              <Link href="/profile/kyc" className="flex items-center text-primary hover:underline">
                <LinkIcon className="h-4 w-4 mr-1" />
                Complete Identity Verification
              </Link>
            )}
            {errorType === 'setup' && (
              <Link href="/profile/setup" className="flex items-center text-primary hover:underline">
                <LinkIcon className="h-4 w-4 mr-1" />
                Complete Wallet Setup
              </Link>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <ArrowDown className="mr-2 h-4 w-4" /> Deposit
          </Button>
          <Button variant="outline" size="sm">
            <ArrowUp className="mr-2 h-4 w-4" /> Withdraw
          </Button>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="mr-2 h-4 w-4" /> Transfer
          </Button>
        </div>
      </div>

      {wallets.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No wallet information available
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <Card key={wallet.currency} className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">
                  {wallet.currency.toUpperCase()}
                </CardTitle>
                <span className="text-sm text-muted-foreground">Available</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(parseFloat(wallet.available_balance || '0'), wallet.currency)}
                </div>
                {parseFloat(wallet.pending_balance || '0') > 0 && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Pending: {formatCurrency(parseFloat(wallet.pending_balance), wallet.currency)}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <History className="h-5 w-5" /> Recent Transactions
          </h2>
        </div>
        
        {transactions.length > 0 ? (
          <div className="rounded-lg border bg-card">
            <div className="divide-y">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium capitalize">{tx.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tx.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount), tx.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                No transactions yet
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
