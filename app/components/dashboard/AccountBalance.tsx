//app/components/dashboard/AccountBalance
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Plus, Wallet, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WalletBalance {
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
}

interface ApiResponse {
  status: string;
  message: string;
  data: WalletBalance;
  error?: string;
  redirectTo?: string;
}

export function AccountBalance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [baseCurrency, setBaseCurrency] = useState<string>('NGN');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBalance, setShowBalance] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showBalance');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const response = await fetch(`${baseUrl}/api/wallet/balance`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      const data: ApiResponse = await response.json();
      if (data.status === 'success') {
        setBalances([data.data]);
        setBaseCurrency(data.data.reference_currency || 'NGN');
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000);

      const handleBalanceUpdate = () => {
        fetchBalance();
      };
      window.addEventListener('balanceUpdate', handleBalanceUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('balanceUpdate', handleBalanceUpdate);
      };
    }
  }, [user?.id, fetchBalance]);

  if (error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Get NGN balance
  const ngnWallet = balances.find(w => w.currency === baseCurrency);

  const toggleBalance = () => {
    const newValue = !showBalance;
    setShowBalance(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('showBalance', JSON.stringify(newValue));
    }
  };

  const maskBalance = (amount: string) => {
    return '••••••';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 text-white hover:shadow-xl transition-all duration-300">
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between text-white/90">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <span>Account Balance</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white/80"
                onClick={toggleBalance}
              >
                {showBalance ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-black text-white hover:bg-black/80 border-0"
                onClick={() => setShowDepositModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Deposit
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-[200px] bg-white/20" />
              <Skeleton className="h-4 w-[100px] bg-white/20" />
            </div>
          ) : (
            <motion.div 
              className="space-y-1"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={showBalance ? 'visible' : 'hidden'}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-3xl font-bold tracking-tight" data-testid="wallet-balance">
                    {showBalance 
                      ? (ngnWallet ? formatCurrency(parseFloat(ngnWallet.balance), baseCurrency) : '₦0.00')
                      : '₦••••••'
                    }
                  </div>
                  <div className="text-sm text-white/80">
                    Available: {showBalance 
                      ? (ngnWallet ? formatCurrency(parseFloat(ngnWallet.balance), baseCurrency) : '₦0.00')
                      : '₦••••••'
                    }
                    {ngnWallet && parseFloat(ngnWallet.locked) > 0 && (
                      <span className="ml-2 text-yellow-200">
                        (Locked: {showBalance 
                          ? formatCurrency(parseFloat(ngnWallet.locked), baseCurrency)
                          : '₦••••••'
                        })
                      </span>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit Coming Soon!</DialogTitle>
            <DialogDescription className="pt-4 space-y-4">
              <p>
                We&apos;re working hard to bring you a seamless deposit experience. Soon you&apos;ll be able to:
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Make instant NGN deposits</li>
                <li>Track your transaction history</li>
                <li>Set up automatic deposits</li>
                <li>Get notifications for successful transactions</li>
              </ul>
              <p className="text-sm text-muted-foreground pt-2">
                Stay tuned for updates! We&apos;ll notify you as soon as this feature is available.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
