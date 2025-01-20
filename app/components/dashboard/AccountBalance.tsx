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
import { WalletCardSkeleton } from "@/app/components/wallet/WalletCardSkeleton";

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
  success: boolean;
  data: WalletBalance[];
  message?: string;
}

export function AccountBalance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [balanceData, setBalanceData] = useState<WalletBalance[]>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/wallet/balance", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch balance");
      }

      const data: ApiResponse = await response.json();
      if (!data.success || !data.data) {
        throw new Error(data.message || "Failed to fetch balance");
      }

      setBalanceData(data.data);
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Unable to fetch balance");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  if (isLoading) {
    return <WalletCardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const ngnWallet = balanceData.find(wallet => wallet.currency.toLowerCase() === 'ngn');
  const balance = ngnWallet?.balance || '0.00';

  const toggleBalance = () => {
    setShowBalance(!showBalance);
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
                  {showBalance ? `₦${balance}` : '₦••••••'}
                </div>
                <div className="text-sm text-white/80">
                  Available: {showBalance ? `₦${balance}` : '₦••••••'}
                  {ngnWallet && parseFloat(ngnWallet.locked) > 0 && (
                    <span className="ml-2 text-yellow-200">
                      (Locked: {showBalance ? formatCurrency(parseFloat(ngnWallet.locked), 'NGN') : '₦••••••'})
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
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
