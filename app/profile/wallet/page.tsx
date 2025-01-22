"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Loader2, AlertCircle, LinkIcon, TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft, ArrowRight, ArrowDownUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from 'next/link';
import WalletCard from "@/components/wallet/WalletCard";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { WalletCardSkeleton } from "@/app/components/wallet/WalletCardSkeleton";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import WalletGrid from "@/components/wallet/WalletGrid";
import { Header } from "@/components/Header";
import { ErrorBoundary } from '@/app/components/error-boundary';
import Announcements from '@/components/dashboard/Announcements';
import { ReferralProgram } from '@/components/profile/ReferralProgram';
import TransactionHistory from '@/components/payment/TransactionHistory';

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
  staked: string;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
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
  const { data: session } = useSession();
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'setup' | 'kyc' | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });
  const [favoriteWallets, setFavoriteWallets] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favoriteWallets');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

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
      const balanceResponse = await fetch('/api/wallet/users/me/wallets');
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

  const handleToggleFavorite = (currency: string) => {
    setFavoriteWallets(prev => {
      const newFavorites = prev.includes(currency.toLowerCase())
        ? prev.filter(c => c !== currency.toLowerCase())
        : [...prev, currency.toLowerCase()];
      
      // Save to localStorage
      localStorage.setItem('favoriteWallets', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Calculate total balance
  const totalBalance = wallets.reduce((total, wallet) => {
    return total + parseFloat(wallet.converted_balance || '0');
  }, 0);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Please sign in to view your wallets</p>
      </div>
    );
  }

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
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Portfolio Overview */}
          <Card className="bg-green-600 dark:bg-green-600">
            <CardHeader>
              <CardTitle className="text-white">Total Portfolio Value</CardTitle>
              <CardDescription className="text-white/80">Your total assets across all currencies</CardDescription>
            </CardHeader>
            <CardContent>
              <h2 className="text-4xl font-bold text-white">₦{formatCurrency(totalBalance, 'ngn')}</h2>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <ArrowDownLeft className="mr-2 h-4 w-4" />
                  Send/Receive
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Trade
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <History className="mr-2 h-4 w-4" />
                  Transaction History
                </Button>
              </CardContent>
            </Card>

            {/* Referral Program */}
            <Card className="md:col-span-2 bg-gradient-to-br from-green-600/10 to-transparent border-green-600/20">
              <CardHeader>
                <CardTitle className="text-lg">Referral Program</CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <ReferralProgram 
                    referralCode={profile?.referral_code === undefined ? null : profile.referral_code}
                    referralStats={referralStats}
                    onGenerateCode={async () => {
                      toast.info("Referral code generation will be available soon.");
                    }}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>

          {/* Wallets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                currency={wallet.currency}
                balance={parseFloat(wallet.balance)}
                locked={parseFloat(wallet.locked)}
                isFavorite={favoriteWallets.includes(wallet.currency.toLowerCase())}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>

          {/* Transaction History */}
          <Card className="bg-white dark:bg-gray-800/50 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold dark:text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary>
                <TransactionHistory limit={5} />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
