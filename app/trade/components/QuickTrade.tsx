"use client";

import { useState, useEffect, forwardRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowDownUp, Loader2, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/app/context/AuthContext";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatNumber } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { PaymentMethodType } from '@/app/types/payment';

interface QuickTradeProps {
  onTradePreview?: (trade: TradeDetails) => void;
}

interface Currency {
  value: string;
  label: string;
  maxLimit: number;
  minLimit: number;
}

const SUPPORTED_CURRENCIES: Currency[] = [
  { value: 'btc', label: 'Bitcoin (BTC)', maxLimit: 1, minLimit: 0.0001 },
  { value: 'eth', label: 'Ethereum (ETH)', maxLimit: 10, minLimit: 0.001 },
  { value: 'usdt', label: 'Tether (USDT)', maxLimit: 10000, minLimit: 1 },
  { value: 'usdc', label: 'USD Coin (USDC)', maxLimit: 10000, minLimit: 1 },
  { value: 'ngn', label: 'Nigerian Naira (NGN)', maxLimit: 5000000, minLimit: 100 },
];

const QUIDAX_USER_ID = '157fa815-214e-4ecd-8a25-448fe4815ff1';

// Forward ref wrapper for Select components
const SelectWrapper = forwardRef((props: any, ref) => (
  <Select {...props} />
));
SelectWrapper.displayName = 'SelectWrapper';

export function QuickTrade({ onTradePreview }: QuickTradeProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [fromCurrency, setFromCurrency] = useState('usdt');
  const [toCurrency, setToCurrency] = useState('ngn');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [quotationTimer, setQuotationTimer] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showLargeTradeWarning, setShowLargeTradeWarning] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5); // 0.5%

  const fetchWalletBalance = useCallback(async () => {
    if (!user?.id || isLoadingBalance) return;
    setIsLoadingBalance(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session available');
      
      const response = await fetch(`/api/wallet/balance?currency=${fromCurrency.toLowerCase()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet balance');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setWalletBalance(Number(data.data.balance) || 0);
      } else {
        throw new Error(data.message || 'Failed to fetch wallet balance');
      }
    } catch (error) {
      console.error('Check balance error:', error);
      setWalletBalance(0);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to fetch balance",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBalance(false);
    }
  }, [user?.id, fromCurrency, toast, supabase]);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  useEffect(() => {
    if (quotationTimer > 0) {
      const timer = setInterval(() => {
        setQuotationTimer((prev) => {
          if (prev <= 1) {
            setQuote(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quotationTimer]);

  const handleMaxAmount = useCallback(() => {
    if (!walletBalance) {
      toast({
        title: "Balance Unavailable",
        description: "Please wait while we fetch your wallet balance",
        variant: "destructive"
      });
      return;
    }

    const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.value === fromCurrency);
    if (!selectedCurrency) return;

    const maxAmount = Math.min(walletBalance, selectedCurrency.maxLimit);
    setAmount(maxAmount.toString());
  }, [walletBalance, fromCurrency, toast]);

  const handleGetQuote = useCallback(async () => {
    if (!amount || !fromCurrency || !toCurrency) {
      toast({
        title: "Invalid Input",
        description: "Please enter an amount and select currencies",
        variant: "destructive"
      });
      return;
    }

    const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.value === fromCurrency);
    if (!selectedCurrency) return;

    const numAmount = parseFloat(amount);
    if (numAmount < selectedCurrency.minLimit) {
      toast({
        title: "Amount Too Low",
        description: `Minimum amount is ${selectedCurrency.minLimit} ${selectedCurrency.value.toUpperCase()}`,
        variant: "destructive"
      });
      return;
    }

    if (numAmount > selectedCurrency.maxLimit) {
      setShowLargeTradeWarning(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session available');

      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          from_currency: fromCurrency.toLowerCase(),
          to_currency: toCurrency.toLowerCase(),
          from_amount: amount
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get quote');
      }

      const { data } = await response.json();
      if (!data?.id) {
        throw new Error('Invalid quote response - missing ID');
      }

      setQuote(data);
      setQuotationTimer(14);
    } catch (error) {
      toast({
        title: "Quote Error",
        description: error instanceof Error ? error.message : "Failed to get quote",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [amount, fromCurrency, toCurrency, toast]);

  const handleSwap = async () => {
    if (!user?.id || !quote?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please get a quote first.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authentication session available');

      const response = await fetch('/api/trades/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          tradeId: quote.id,
          userId: user.id,
          type: 'swap',
          currency: fromCurrency,
          amount: parseFloat(amount),
          rate: parseFloat(quote.quoted_price),
          fees: {
            platform: parseFloat(amount) * 0.016,
            processing: parseFloat(amount) * 0.014,
            total: parseFloat(amount) * 0.03
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm swap');
      }

      const data = await response.json();
      
      // Create a trade object for preview
      const trade: TradeDetails = {
        id: data.id,
        price: parseFloat(quote.quoted_price),
        amount: parseFloat(amount),
        total: parseFloat(quote.quoted_price) * parseFloat(amount),
        type: 'buy',
        timestamp: new Date().toISOString(),
        pair: `${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}`,
        currency: fromCurrency,
        rate: parseFloat(quote.quoted_price),
        status: TradeStatus.COMPLETED,
        payment_method: 'wallet' as PaymentMethodType,
        created_at: new Date().toISOString(),
        user_id: user.id,
        fees: {
          platform: parseFloat(amount) * 0.016,
          processing: parseFloat(amount) * 0.014,
          total: parseFloat(amount) * 0.03
        }
      };

      // Call onTradePreview with the trade
      if (onTradePreview) {
        onTradePreview(trade);
      }

      // Reset form
      setAmount('');
      setQuote(null);
      setQuotationTimer(0);
      fetchWalletBalance();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm swap",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setQuote(null);
    setQuotationTimer(0);
    setAmount('');
  };

  const renderLargeTradeWarning = () => (
    <Dialog open={showLargeTradeWarning} onOpenChange={setShowLargeTradeWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Large Trade Warning</DialogTitle>
          <DialogDescription>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                <p>You are about to make a large trade.</p>
              </div>
              <p>Please be aware that large trades may:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Have higher price impact</li>
                <li>Result in less favorable rates</li>
                <li>Take longer to process</li>
              </ul>
              <div className="flex items-center space-x-2 text-blue-600">
                <Info className="h-5 w-5" />
                <p>Consider breaking this into smaller trades for better rates.</p>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setShowLargeTradeWarning(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowLargeTradeWarning(false);
                  handleGetQuote();
                }}>
                  Proceed Anyway
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card className="w-full bg-orange-200 dark:bg-orange-900/50 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold dark:text-white">Quick Trade</CardTitle>
        <CardDescription className="dark:text-gray-300">Instantly buy or sell crypto</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-orange-300/50 dark:bg-orange-800/50">
            <TabsTrigger value="buy" className="data-[state=active]:bg-white dark:data-[state=active]:bg-orange-950/60 dark:text-white">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-white dark:data-[state=active]:bg-orange-950/60 dark:text-white">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SelectWrapper value={fromCurrency} onValueChange={setFromCurrency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={`https://assets.coingecko.com/coins/images/1/${currency.value}.png`}
                                    alt={currency.label}
                                    className="w-5 h-5"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/images/crypto/generic.svg';
                                    }}
                                  />
                                  <span>{currency.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SelectWrapper>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select the currency you want to trade from</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={switchCurrencies}
                >
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SelectWrapper value={toCurrency} onValueChange={setToCurrency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src={`https://assets.coingecko.com/coins/images/1/${currency.value}.png`}
                                    alt={currency.label}
                                    className="w-5 h-5"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/images/crypto/generic.svg';
                                    }}
                                  />
                                  <span>{currency.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SelectWrapper>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select the currency you want to trade to</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  {walletBalance > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Available: {formatNumber(walletBalance)} {fromCurrency.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="flex-1"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" onClick={handleMaxAmount}>
                          MAX
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Use maximum available balance</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleGetQuote}
                disabled={isLoading || !amount}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Quote...
                  </>
                ) : (
                  'Get Quote'
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="sell" className="space-y-4">
            {/* Similar content as buy tab but with reversed currency selection */}
            <div className="space-y-4 mt-4">
              {/* Copy the buy tab content here and adjust for sell */}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      {renderLargeTradeWarning()}
    </Card>
  );
} 