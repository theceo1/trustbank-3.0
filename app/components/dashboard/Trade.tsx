// app/components/dashboard/Trade.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TradeDetails, TradeQuotation } from '@/app/types/trade';
import { formatNumber } from '@/app/lib/utils';

const SUPPORTED_CURRENCIES = [
  { value: 'USDT', label: 'USDT' },
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'USDC', label: 'USDC' }
];

const formatCryptoBalance = (amount: number, currency: string) => {
  return `${formatNumber(amount, 8)} ${currency}`;
};

export function Trade() {
  const router = useRouter();
  const { user, getToken } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDT');
  const [amount, setAmount] = useState<string>('');
  const [quotation, setQuotation] = useState<TradeQuotation | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [quotationTimer, setQuotationTimer] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id || isLoadingBalance) return;
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(`/api/wallet/users/me/wallets/${selectedCurrency.toLowerCase()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.status === 401) {
        router.push('/auth/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      const data = await response.json();
      setWalletBalance(Number(data.balance) || 0);
    } catch (error) {
      console.error('Check balance error:', error);
      setWalletBalance(0);
      toast({
        title: "Error",
        description: "Unable to fetch balance. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBalance(false);
    }
  }, [selectedCurrency, user?.id, getToken, toast, router]);

  const handleReviewTrade = useCallback(async () => {
    if (!user?.id || !amount || parseFloat(amount) <= 0) return;
    
    try {
      const token = await getToken();
      setIsReviewing(true);
      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromCurrency: selectedCurrency,
          toCurrency: 'ngn',
          amount: parseFloat(amount)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get quote');
      }

      const quote = await response.json();
      if (!quote || !quote.data) {
        throw new Error('Invalid quote response');
      }

      setQuotation({
        ...quote.data,
        expiresAt: Date.now() + 14000 // 14 seconds
      });
      setQuotationTimer(14);
      
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

      return () => clearInterval(interval);
    } catch (error) {
      console.error('Quote error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get quote",
        variant: "destructive"
      });
    } finally {
      setIsReviewing(false);
    }
  }, [user?.id, amount, selectedCurrency, getToken, toast]);

  const handleConfirmTrade = async () => {
    if (!user?.id || !quotation) return;
    
    try {
      const token = await getToken();
      setLoading(true);
      const response = await fetch('/api/trades/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quotationId: quotation.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm trade');
      }

      const confirmedTrade = await response.json();
      
      toast({
        title: "Success",
        description: "Trade confirmed successfully",
      });
      
      router.push(`/trades/${confirmedTrade.id}`);
    } catch (error) {
      console.error('Trade confirmation error:', error);
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Unable to process trade at this time",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    setWalletBalance(0); // Reset balance when currency changes
    fetchWalletBalance(); // Fetch new balance
  };

  useEffect(() => {
    if (user?.id) {
      fetchWalletBalance();
    }
  }, [user?.id]); // Only fetch on mount and user change

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <Select
          value={selectedCurrency}
          onValueChange={handleCurrencyChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map(currency => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-500">
          {isLoadingBalance ? (
            "Loading balance..."
          ) : (
            `Available balance: ${formatCryptoBalance(walletBalance, selectedCurrency)}`
          )}
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
            {quotation && (
              <div className="text-sm text-gray-600 mt-2">
                Rate expires in: {quotationTimer}s
              </div>
            )}
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