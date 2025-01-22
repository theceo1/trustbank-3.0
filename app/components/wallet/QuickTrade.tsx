"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, Loader2, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";
import { useAuth } from "@/app/context/AuthContext";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatNumber } from '@/app/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TradeDetails } from '@/app/types/trade';
import { CryptoIcons } from "@/app/components/icons/CryptoIcons";

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

  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (!user) return;
      setIsLoadingBalance(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No authentication session available');

        const response = await fetch(`/api/wallet/balance?currency=${fromCurrency}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wallet balance');
        }

        const { data } = await response.json();
        setWalletBalance(data.balance || 0);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setWalletBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchWalletBalance();
  }, [user, fromCurrency, supabase]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quotationTimer > 0) {
      timer = setInterval(() => {
        setQuotationTimer(prev => prev - 1);
      }, 1000);
    } else if (quote) {
      setQuote(null);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quotationTimer, quote]);

  const switchCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setQuote(null);
    setQuotationTimer(0);
    setAmount('');
  };

  const handleMaxAmount = () => {
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
  };

  const handleGetQuote = async () => {
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
      if (onTradePreview) {
        onTradePreview(data);
      }
    } catch (error) {
      toast({
        title: "Quote Error",
        description: error instanceof Error ? error.message : "Failed to get quote",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
              <p>Please note that large trades may have higher price impact and less favorable rates. It&apos;s recommended to split large trades into smaller amounts for better rates.</p>
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
                        <Select value={fromCurrency} onValueChange={setFromCurrency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                <div className="flex items-center space-x-2">
                                  {CryptoIcons[currency.value.toUpperCase() as keyof typeof CryptoIcons] ? (
                                    <div className="w-5 h-5">
                                      {CryptoIcons[currency.value.toUpperCase() as keyof typeof CryptoIcons]()}
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold">{currency.value.toUpperCase().slice(0, 3)}</span>
                                    </div>
                                  )}
                                  <span>{currency.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select value={toCurrency} onValueChange={setToCurrency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_CURRENCIES.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                <div className="flex items-center space-x-2">
                                  {CryptoIcons[currency.value.toUpperCase() as keyof typeof CryptoIcons] ? (
                                    <div className="w-5 h-5">
                                      {CryptoIcons[currency.value.toUpperCase() as keyof typeof CryptoIcons]()}
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold">{currency.value.toUpperCase().slice(0, 3)}</span>
                                    </div>
                                  )}
                                  <span>{currency.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
              {quote && (
                <div className="space-y-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Rate</span>
                    <span className="font-medium">
                      1 {fromCurrency.toUpperCase()} = {formatNumber(quote.rate)} {toCurrency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">You&apos;ll receive</span>
                    <span className="font-medium">
                      {formatNumber(quote.to_amount)} {toCurrency.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Quote expires in</span>
                    <span className="font-medium text-orange-600">{quotationTimer}s</span>
                  </div>
                </div>
              )}
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
                ) : quote ? (
                  'Refresh Quote'
                ) : (
                  'Get Quote'
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="sell" className="space-y-4">
            {/* Similar content for sell tab */}
          </TabsContent>
        </Tabs>
      </CardContent>
      {renderLargeTradeWarning()}
    </Card>
  );
} 