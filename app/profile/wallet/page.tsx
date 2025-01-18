"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Loader2, AlertCircle, LinkIcon, TrendingUp, Wallet, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from 'next/link';
import WalletCard from "@/components/wallet/WalletCard";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
  currency: string;
  balance: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const router = useRouter();
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
        
        const response = await fetch('/api/wallet');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Unable to fetch wallet information');
        }
        
        const data = await response.json();
        if (data.status !== 'success' || !Array.isArray(data.data)) {
          throw new Error('Unable to load wallet information. Please try again later.');
        }
        
        const filteredWallets = data.data
          .filter((wallet: WalletData) => CORE_CURRENCIES.includes(wallet.currency.toLowerCase()))
          .sort((a: WalletData, b: WalletData) => {
            const indexA = CORE_CURRENCIES.indexOf(a.currency.toLowerCase());
            const indexB = CORE_CURRENCIES.indexOf(b.currency.toLowerCase());
            return indexA - indexB;
          });

        setWallets(filteredWallets);

        // Only fetch transactions if we have wallet data
        if (filteredWallets.length > 0) {
          const txResponse = await fetch('/api/transactions');
          if (txResponse.ok) {
            const txData = await txResponse.json();
            if (txData.status === 'success' && Array.isArray(txData.data)) {
              setTransactions(txData.data);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to fetch wallet information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
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
              <Link href="/profile/verification" className="flex items-center text-primary hover:underline">
                <LinkIcon className="h-4 w-4 mr-1" />
                Complete Identity Verification
              </Link>
            )}
            {errorType === 'setup' && (
              <Link href="/wallet/setup" className="flex items-center text-primary hover:underline">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Wallet</h1>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push('/profile/activity')}
          >
            <History className="h-4 w-4" />
            View All Activity
          </Button>
        </div>

        {/* Promotional Banners */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-r from-green-600/10 to-green-600/5 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-2">Start Trading Today</h3>
            <p className="text-muted-foreground mb-4">Buy, sell, and swap your favorite cryptocurrencies instantly.</p>
            <Button onClick={() => router.push('/trade')} className="bg-green-600 hover:bg-green-700">
              Trade Now <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gradient-to-r from-blue-600/10 to-blue-600/5 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold mb-2">Refer & Earn</h3>
            <p className="text-muted-foreground mb-4">Invite friends and earn up to $50 USDT for each referral.</p>
            <Button variant="outline" onClick={() => router.push('/profile/referral')}>
              Get Started <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
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
              <WalletCard
                key={wallet.currency}
                currency={wallet.currency}
                balance={parseFloat(wallet.balance)}
                showTransfer={wallet.currency.toLowerCase() !== 'ngn'}
                onTrade={() => router.push(`/trade/${wallet.currency.toLowerCase()}`)}
                percentageChange={0}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Transactions
            </h2>
          </div>
          
          {transactions.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {transactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
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
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No transactions yet
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 mt-8 mb-8">
        <Card className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => router.push('/trade')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-600/10 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Trade</h3>
                <p className="text-sm text-muted-foreground">Buy, sell, and swap cryptocurrencies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => router.push('/profile/security')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-600/10 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Security</h3>
                <p className="text-sm text-muted-foreground">Manage wallet security</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
