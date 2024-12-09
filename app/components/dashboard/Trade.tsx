//app/components/dashboard/Trade.tsx
"use client";

import { useRouter } from 'next/navigation';
import { ArrowRight } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TradeDetails } from '@/app/types/trade';
import { useState, useEffect, useCallback } from 'react';
import { QuidaxService } from '@/app/lib/services/quidax';

interface TradeProps {
  initialTrade?: TradeDetails;
}

export function Trade({ initialTrade }: TradeProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDT');
  const [amount, setAmount] = useState<string>('');
  const [quotation, setQuotation] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [quotationTimer, setQuotationTimer] = useState<number>(0);

  const formatCryptoBalance = (amount: number, currency: string) => {
    return `${amount.toFixed(8)} ${currency}`;
  };

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id) {
      router.push('/login');
      return;
    }
    
    try {
      const response = await fetch(`/api/wallet/balance/${selectedCurrency.toLowerCase()}`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch balance');
      }
      
      const data = await response.json();
      setWalletBalance(Number(data.balance));
    } catch (error) {
      console.error('Check balance error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet balance",
        variant: "destructive"
      });
    }
  }, [selectedCurrency, user?.id, router, toast]);

  const handleReviewTrade = useCallback(async () => {
    if (!user?.id || !amount || parseFloat(amount) <= 0) return;
    
    try {
      setIsReviewing(true);
      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCurrency: selectedCurrency,
          toCurrency: 'ngn',
          amount: parseFloat(amount)
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to get quotation');
      }
  
      const quote = await response.json();
      setQuotation(quote);
      
      const expiryTime = new Date(quote.expires_at).getTime();
      const now = Date.now();
      setQuotationTimer(Math.floor((expiryTime - now) / 1000));
      
      const interval = setInterval(() => {
        setQuotationTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setQuotation(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
  
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get trade quotation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReviewing(false);
    }
  }, [user?.id, amount, selectedCurrency, toast]);
   
  const handleConfirmTrade = async () => {
    if (!user?.id || !quotation) return;
    
    try {
      const confirmedTrade = await QuidaxService.confirmSwapQuotation(user.id, quotation.id);
      router.push(`/trades/${confirmedTrade.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm trade. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchWalletBalance();
    }
  }, [user?.id, fetchWalletBalance]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <Select
          value={selectedCurrency}
          onValueChange={setSelectedCurrency}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USDT">USDT</SelectItem>
            <SelectItem value="BTC">BTC</SelectItem>
            <SelectItem value="ETH">ETH</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-500">
          Available balance: {formatCryptoBalance(walletBalance, selectedCurrency)}
        </div>

        <Input
          type="number"
          placeholder="Amount to sell"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          max={walletBalance}
        />

        {!quotation ? (
          <Button 
            onClick={handleReviewTrade} 
            disabled={isReviewing || !amount || parseFloat(amount) <= 0}
          >
            {isReviewing ? 'Getting Quote...' : 'Proceed'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-sm">
              Rate expires in: {quotationTimer}s
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleConfirmTrade}
                disabled={loading}
              >
                Confirm Trade
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setQuotation(null)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}