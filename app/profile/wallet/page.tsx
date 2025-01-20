"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Loader2, AlertCircle, LinkIcon, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from 'next/link';
import WalletCard from "@/components/wallet/WalletCard";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { WalletCardSkeleton } from "@/app/components/wallet/WalletCardSkeleton";

// Core currencies we want to display
const CORE_CURRENCIES = ['ngn', 'btc', 'eth', 'usdt', 'usdc', 'bnb'];

interface Transaction {
  id: string;
  type: string;
  amount: string;
  currency: string;
  status: string;
  created_at: string;
}

interface WalletData {
  id: string;
  currency: string;
  balance: string;
  locked: string;
  percentageChange: number;
  blockchain_enabled?: boolean;
  deposit_address?: string;
  destination_tag?: string;
  networks?: Array<{
    name: string;
    address: string;
    destination_tag?: string;
  }>;
}

interface WalletCardProps {
  currency: string;
  balance: number;
  percentageChange: number;
  isLoading?: boolean;
  onTrade: () => void;
  showTransfer?: boolean;
}

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'setup' | 'kyc' | null>(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorType(null);
      
      // First check if user has completed KYC and has quidax_id
      const profileResponse = await fetch('/api/profile');
      if (!profileResponse.ok) {
        const data = await profileResponse.json();
        if (data.error === 'Profile not found') {
          setErrorType('setup');
          throw new Error('Please complete your profile setup.');
        }
        throw new Error(data.error || 'Failed to fetch profile');
      }
      
      const profileData = await profileResponse.json();
      if (!profileData.quidax_id) {
        setErrorType('setup');
        throw new Error('Please complete your wallet setup to continue.');
      }
      
      // Fetch wallet balances
      const balanceResponse = await fetch('/api/wallet/balance');
      if (!balanceResponse.ok) {
        const data = await balanceResponse.json();
        throw new Error(data.error || 'Unable to fetch wallet balances');
      }
      
      const balanceData = await balanceResponse.json();
      if (!balanceData.data || !Array.isArray(balanceData.data)) {
        throw new Error('Unable to load wallet information. Please try again later.');
      }
      
      const filteredWallets = balanceData.data
        .filter((wallet: WalletData) => CORE_CURRENCIES.includes(wallet.currency.toLowerCase()))
        .map((wallet: WalletData) => ({
          ...wallet,
          percentageChange: 0
        }))
        .sort((a: WalletData, b: WalletData) => {
          const indexA = CORE_CURRENCIES.indexOf(a.currency.toLowerCase());
          const indexB = CORE_CURRENCIES.indexOf(b.currency.toLowerCase());
          return indexA - indexB;
        });

      setWallets(filteredWallets);

      // Only fetch transactions if we have wallet data
      if (filteredWallets.length > 0) {
        const txResponse = await fetch('/api/transactions?limit=5');
        if (txResponse.ok) {
          const txData = await txResponse.json();
          if (txData.status === 'success' && Array.isArray(txData.data)) {
            setTransactions(txData.data);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wallet data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <WalletCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant={errorType === 'setup' ? 'default' : 'destructive'}>
          <AlertTitle>
            {errorType === 'setup' ? 'Wallet Setup Required' : 'Error'}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {error}
            {errorType === 'setup' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => router.push('/profile')}
              >
                Complete Setup
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Start Trading Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle>Start Trading Today</CardTitle>
            <CardDescription className="text-white/90">
              Buy, sell, and swap your favorite cryptocurrencies instantly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="secondary" 
              className="bg-white text-indigo-600 hover:bg-white/90"
              onClick={() => router.push('/trade')}
            >
              Trade Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle>Refer & Earn</CardTitle>
            <CardDescription className="text-white/90">
              Invite friends and earn up to $50 USDT for each referral.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="secondary" 
              className="bg-white text-indigo-600 hover:bg-white/90"
              onClick={() => router.push('/profile#referral')}
            >
              Get Code
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <WalletCard
            key={wallet.currency}
            wallet={wallet}
            onAction={(action) => {
              switch (action) {
                case 'deposit':
                  // Handle deposit
                  break;
                case 'withdraw':
                  // Handle withdraw
                  break;
                case 'trade':
                  router.push('/trade');
                  break;
              }
            }}
          />
        ))}
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    {tx.type === 'withdrawal' ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <div className="font-medium">{tx.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(parseFloat(tx.amount), tx.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
