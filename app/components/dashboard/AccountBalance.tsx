//app/components/dashboard/AccountBalance
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Plus, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from "framer-motion";
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
  balance: number;
  locked: number;
  total: number;
}

interface ApiResponse {
  status: string;
  message: string;
  data: WalletBalance[];
  base_currency: string;
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

  const fetchBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet/balances');
      const data: ApiResponse = await response.json();

      if (!response.ok) {
        if (data.redirectTo) {
          toast({
            title: "Verification Required",
            description: data.message || "Please complete KYC verification to view your balance",
            variant: "destructive"
          });
        }
        throw new Error(data.error || 'Failed to fetch balance');
      }

      if (data.status === 'success' && Array.isArray(data.data)) {
        setBalances(data.data);
        setBaseCurrency(data.base_currency);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to fetch balance',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBalance();
      // Refresh every 30 seconds
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 text-white hover:shadow-xl transition-all duration-300">
        <CardHeader className="relative">
          <CardTitle className="flex items-center space-x-2 text-white/90">
            <Wallet className="h-5 w-5" />
            <span>Account Balance</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="absolute right-6 top-6 bg-black text-white hover:bg-black/80 border-0"
            onClick={() => setShowDepositModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Deposit
          </Button>
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
              <div className="text-3xl font-bold tracking-tight">
                {ngnWallet ? formatCurrency(ngnWallet.total, baseCurrency) : '₦0.00'}
              </div>
              <div className="text-sm text-white/80">
                Available: {ngnWallet ? formatCurrency(ngnWallet.balance, baseCurrency) : '₦0.00'}
                {ngnWallet && ngnWallet.locked > 0 && (
                  <span className="ml-2 text-yellow-200">
                    (Locked: {formatCurrency(ngnWallet.locked, baseCurrency)})
                  </span>
                )}
              </div>
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
                We're working hard to bring you a seamless deposit experience. Soon you'll be able to:
              </p>
              <ul className="list-disc pl-4 space-y-2">
                <li>Make instant NGN deposits</li>
                <li>Track your transaction history</li>
                <li>Set up automatic deposits</li>
                <li>Get notifications for successful transactions</li>
              </ul>
              <p className="text-sm text-muted-foreground pt-2">
                Stay tuned for updates! We'll notify you as soon as this feature is available.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
