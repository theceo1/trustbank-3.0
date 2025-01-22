// app/components/dashboard/Trade.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from '@/app/lib/utils';
import { debug } from '@/app/lib/utils/debug';
import { TradeQuote } from '@/app/types/trade';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseClient } from '@/app/lib/supabase/client';

const SUPPORTED_CURRENCIES = [
  { value: 'USDT', label: 'USDT' },
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'USDC', label: 'USDC' }
];

const formatCryptoBalance = (amount: number, currency: string) => {
  return `${formatNumber(amount)} ${currency}`;
};

export function Trade() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const supabase = getSupabaseClient();
  
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USDT');
  const [amount, setAmount] = useState<string>('');
  const [quotation, setQuotation] = useState<TradeQuote | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [quotationTimer, setQuotationTimer] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('sell');

  // Add countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quotationTimer > 0) {
      timer = setInterval(() => {
        setQuotationTimer((prev) => {
          if (prev <= 1) {
            setQuotation(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quotationTimer]);

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id || isLoadingBalance) return;
    setIsLoadingBalance(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session available');
      
      const profileResponse = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!profileResponse.ok) throw new Error('Failed to fetch profile');
      
      const profileData = await profileResponse.json();
      if (!profileData?.quidax_user_id) {
        // Create Quidax account if needed
        const createResponse = await fetch('/api/create-quidax-account', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!createResponse.ok) throw new Error('Failed to create trading account');
        const newProfile = await createResponse.json();
        profileData.quidax_user_id = newProfile.data.quidax_user_id;
      }
      
      // Now fetch the wallet with retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          const walletResponse = await fetch(
            `/api/wallet/users/${profileData.quidax_user_id}/wallets/${selectedCurrency.toLowerCase()}`,
            {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (walletResponse.ok) {
            const data = await walletResponse.json();
            setWalletBalance(Number(data.data.balance) || 0);
            break;
          }
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          retries--;
          if (retries === 0) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
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
  }, [user?.id, selectedCurrency, toast]);

  const handleReviewTrade = useCallback(async () => {
    debug.trade('Starting trade review');
    debug.trade('User data:', user);
    
    if (!user?.id || !amount || parseFloat(amount) <= 0) {
      debug.error('Invalid trade parameters', { userId: user?.id, amount });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session available');
      
      setIsReviewing(true);
      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          fromCurrency: selectedCurrency,
          toCurrency: 'NGN',
          amount: parseFloat(amount),
          type: tradeType
        })
      });

      debug.trade('Quote response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get quote');
      }

      const data = await response.json();
      debug.trade('Quote data:', data);

      if (!data?.data?.id) {
        throw new Error('Invalid quote response - missing ID');
      }

      setQuotation(data.data);
      setQuotationTimer(14);
    } catch (error) {
      debug.error('Quote error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get quote",
        variant: "destructive"
      });
    } finally {
      setIsReviewing(false);
    }
  }, [user?.id, amount, selectedCurrency, toast, tradeType, supabase]);

  const handleConfirmTrade = async () => {
    debug.trade('Starting trade confirmation...');
    debug.trade('Trade data:', { userId: user?.id, quoteId: quotation?.id });

    if (!user?.id || !quotation?.id) {
      debug.error('Missing required trade data', { userId: user?.id, quoteId: quotation?.id });
      toast({
        title: "Error",
        description: "Trade ID is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session available');
      
      setLoading(true);
      
      debug.trade('Sending trade confirmation request', {
        tradeId: quotation.id,
        userId: user.id
      });

      const response = await fetch('/api/trades/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          tradeId: quotation.id,
          userId: user.id
        })
      });

      const data = await response.json();
      debug.trade('Trade confirmation response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm trade');
      }

      toast({
        title: "Success",
        description: "Trade confirmed successfully",
      });
      
      await fetchWalletBalance();
      router.push(`/trades/${quotation.id}`);
    } catch (error) {
      debug.error('Trade confirmation error:', error);
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Unable to process trade at this time",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setQuotation(null);
    }
  };

  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
    setAmount('');
    setQuotation(null);
    fetchWalletBalance();
  };

  // Fetch initial balance
  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sell" onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sell">Sell Crypto</TabsTrigger>
          <TabsTrigger value="buy">Buy Crypto</TabsTrigger>
        </TabsList>
        <TabsContent value="sell" className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Currency</label>
              <Select value={selectedCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                Available: {formatCryptoBalance(walletBalance, selectedCurrency)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {quotation && (
              <div className="p-4 bg-card rounded-lg border">
                <h3 className="font-medium mb-2">Trade Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>You&apos;re selling:</span>
                    <span>{formatCryptoBalance(Number(amount), selectedCurrency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>You&apos;ll receive:</span>
                    <span>₦{formatNumber(Number(quotation.estimatedAmount))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Rate:</span>
                    <span>₦{formatNumber(Number(quotation.rate))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Expires in:</span>
                    <span>{quotationTimer}s</span>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              onClick={quotation ? handleConfirmTrade : handleReviewTrade}
              disabled={!amount || loading || isReviewing || isLoadingBalance}
            >
              {loading ? (
                "Processing..."
              ) : isReviewing ? (
                "Getting quote..."
              ) : quotation ? (
                "Confirm Trade"
              ) : (
                "Review Trade"
              )}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="buy" className="space-y-4">
          <div className="flex items-center justify-center h-32 bg-card rounded-lg border">
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}