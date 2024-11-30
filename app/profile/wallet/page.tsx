// app/profile/wallet/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { motion } from "framer-motion";
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Clock, Eye, 
  EyeOff, Repeat, AlertCircle, TrendingUp, 
  DollarSign, CreditCard, History, Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import supabase from '@/lib/supabase/client';
import WalletPageSkeleton from "@/app/components/skeletons/WalletPageSkeleton";
import { Badge } from "@/components/ui/badge";
import BackButton from "@/components/ui/back-button";
import { TransactionService } from '@/app/lib/services/transaction';
import { Transaction, TransactionFilters } from "@/app/types/transactions";
import { WalletService } from '@/app/lib/services/wallet';
import { WalletBalance } from '@/app/types/market';

export const dynamic = 'force-dynamic';

interface WalletData {
  balance: number;
  total_deposits: number;
  total_withdrawals: number;
  last_transaction_at: string;
}

interface Wallet {
  id: string;
  balance: number;
  // ... other wallet properties
}

interface PostgresChangesPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Transaction;
  old: Transaction | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function WalletPage() {
  const router = useRouter();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletBalances, setWalletBalances] = useState<Wallet[]>([]);

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/login?redirect=/profile/wallet');
      return;
    }
  }, [user, isLoading, router]);

  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    
    try {
      const balances = await WalletService.getWalletBalance(user.id);
      const formattedBalances: Wallet[] = balances.map(balance => ({
        id: balance.currency,
        balance: balance.available
      }));
      setWalletBalances(formattedBalances);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user || !wallet?.id) return;

    try {
      const filters: TransactionFilters = {
        currency: wallet.id,
        limit: 5,
        status: 'all',
        dateRange: '30d'
      };
      const data = await TransactionService.getUserTransactions(user.id, filters);
      setTransactions(data || []);
    } catch (err) {
      console.error('Transaction fetch error:', err);
    }
  }, [user, wallet?.id]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        await fetchWalletData();
        if (wallet?.id) {
          await fetchTransactions();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    if (user && wallet?.id) {
      const subscription = TransactionService.subscribeToTransactions(
        user.id,
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [payload.new, ...prev.slice(0, 4)]);
            fetchWalletData();
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchWalletData, fetchTransactions, wallet?.id]);

  const handleDeposit = async () => {
    if (!user || !depositAmount || !wallet?.id) return;

    try {
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      await TransactionService.createFiatTransaction({  
        user_id: user.id,
        amount,
        type: 'deposit',
        status: 'pending',
        currency: 'NGN',
        updated_at: new Date().toISOString(),
        payment_reference: `DEP-${Date.now()}`
      });

      setIsDepositModalOpen(false);
      setDepositAmount("");
      toast({
        id: `deposit-${Date.now()}`,
        title: "Deposit Initiated",
        description: "Your deposit is being processed.",
      });

      await Promise.all([fetchWalletData(), fetchTransactions()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process deposit';
      toast({
        id: `error-${Date.now()}`,
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchWalletBalances = async () => {
      try {
        const balances: WalletBalance[] = await WalletService.getWalletBalance(user.id);
        const formattedBalances: Wallet[] = balances.map(balance => ({
          id: balance.id || '',
          balance: balance.available
        }));
        setWalletBalances(formattedBalances);
      } catch (error) {
        console.error('Error fetching wallet balances:', error);
      }
    };

    fetchWalletBalances();
  }, [user]);

  if (!user || isLoading) {
    return <WalletPageSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      className="container mx-auto py-8 px-4 mt-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <BackButton />
      <motion.div variants={itemVariants} className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold">Wallet Balance</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold">
                      {showBalance ? `₦${(walletData?.balance || 0).toLocaleString()}` : '•••••••'}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                    >
                      {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">Available Balance</p>
                </div>
                <Button onClick={() => setIsDepositModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="text-green-600" />
                    <p className="font-medium">Total Deposits</p>
                  </div>
                  <p className="text-xl font-bold">
                    {showBalance ? `₦${(walletData?.total_deposits || 0).toLocaleString()}` : '****'}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownLeft className="text-red-600" />
                    <p className="font-medium">Total Withdrawals</p>
                  </div>
                  <p className="text-xl font-bold">
                    {showBalance ? `₦${(walletData?.total_withdrawals || 0).toLocaleString()}` : '****'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {tx.type === 'deposit' ? (
                        <ArrowUpRight className="text-green-500" />
                      ) : (
                        <ArrowDownLeft className="text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}₦{(tx.amount || 0).toLocaleString()}
                      </p>
                      <Badge 
                        variant={
                          tx.status === 'completed' ? 'default' : 
                          tx.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <Button asChild variant="link">
                <Link href="/profile/transaction-history">
                  <History className="h-4 w-4 mr-2" />
                  View All Transactions
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Modal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)}
        title="Deposit Funds"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Enter the amount you want to deposit into your wallet
            </p>
          </div>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              placeholder="Enter amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={handleDeposit}
            className="w-full"
          >
            Proceed to Payment
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
