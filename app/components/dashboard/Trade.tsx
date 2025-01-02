// app/components/dashboard/Trade.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber } from '@/app/lib/utils';
import { debug } from '@/app/lib/utils/debug';
import { TradeQuotation } from '@/app/types/trade';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      const token = await getToken();
      if (!token) throw new Error('No authentication token available');
      
      const profileResponse = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
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
            'Authorization': `Bearer ${token}`,
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
                'Authorization': `Bearer ${token}`,
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
  }, [user?.id, selectedCurrency, getToken, toast]);

  const handleReviewTrade = useCallback(async () => {
    debug.trade('Starting trade review');
    debug.trade('User data:', user);
    
    if (!user?.id || !amount || parseFloat(amount) <= 0) {
      debug.error('Invalid trade parameters', { userId: user?.id, amount });
      return;
    }

    try {
      const token = await getToken();
      debug.trade('Got auth token');
      
      setIsReviewing(true);
      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
  }, [user?.id, amount, selectedCurrency, getToken, toast, tradeType]);

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
      const token = await getToken();
      setLoading(true);
      
      debug.trade('Sending trade confirmation request', {
        tradeId: quotation.id,
        userId: user.id
      });

      const response = await fetch('/api/trades/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
    setWalletBalance(0); // Reset balance when currency changes
    fetchWalletBalance(); // Fetch new balance
  };

  useEffect(() => {
    if (user?.id) {
      fetchWalletBalance();
    }
  }, [user?.id, fetchWalletBalance]); // Add fetchWalletBalance to dependencies

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm relative">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Trade Cryptocurrency</h3>
        </div>

        <Tabs defaultValue="buy-sell" className="w-full">
          <TabsList className="grid grid-cols-4 gap-4 mb-6">
            <TabsTrigger value="buy-sell">Buy/Sell</TabsTrigger>
            <TabsTrigger value="swap">Swap</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
          </TabsList>

          <TabsContent value="buy-sell" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant={tradeType === 'buy' ? 'default' : 'outline'}
                  onClick={() => setTradeType('buy')}
                >
                  Buy
                </Button>
                <Button 
                  variant={tradeType === 'sell' ? 'default' : 'outline'}
                  onClick={() => setTradeType('sell')}
                >
                  Sell
                </Button>
              </div>

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
                placeholder={`Amount to ${tradeType}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={tradeType === 'sell' ? walletBalance : undefined}
              />

              {quotation && (
                <div className="p-4 border rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">Trade Quote</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>₦{formatNumber(quotation.rate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>You {tradeType}:</span>
                      <span>{formatCryptoBalance(parseFloat(amount), selectedCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>You receive:</span>
                      <span>₦{formatNumber(quotation.amount)}</span>
                    </div>
                    <div className="text-center text-warning mt-2">
                      Rate expires in: {quotationTimer}s
                    </div>
                  </div>
                </div>
              )}

              {!quotation ? (
                <Button 
                  onClick={handleReviewTrade} 
                  disabled={isReviewing || !amount || parseFloat(amount) <= 0}
                  className="w-full"
                >
                  {isReviewing ? 'Getting Quote...' : 'Get Quote'}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleConfirmTrade}
                    disabled={loading}
                    className="w-full"
                  >
                    Confirm Trade
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setQuotation(null)}
                    disabled={loading}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="swap" className="space-y-4">
            <div className="p-4 text-center text-muted-foreground">
              Swap functionality coming soon
            </div>
          </TabsContent>

          <TabsContent value="send" className="space-y-4">
            <div className="p-4 text-center text-muted-foreground">
              Send functionality coming soon
            </div>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4">
            <div className="p-4 text-center text-muted-foreground">
              Receive functionality coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}