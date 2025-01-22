"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useToast } from "@/app/components/ui/use-toast";
import { useAuth } from "@/app/context/AuthContext";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AlertDescription } from "@/components/ui/alert";

const SUPPORTED_CURRENCIES = [
  { symbol: 'btc', name: 'Bitcoin' },
  { symbol: 'eth', name: 'Ethereum' },
  { symbol: 'usdt', name: 'Tether' },
  { symbol: 'sol', name: 'Solana' },
  { symbol: 'bnb', name: 'BNB' },
  { symbol: 'xrp', name: 'XRP' },
  { symbol: 'ngn', name: 'Nigerian Naira' },
];

export function InstantSwap() {
  const { toast } = useToast();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [fromCurrency, setFromCurrency] = useState('usdt');
  const [toCurrency, setToCurrency] = useState('sol');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [quotationTimer, setQuotationTimer] = useState(0);

  const handleGetQuote = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to continue.",
      });
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap.",
      });
      return;
    }

    try {
      setIsLoading(true);
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

      // Start countdown timer
      const timer = setInterval(() => {
        setQuotationTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get quote",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to continue.",
      });
      return;
    }

    if (!quote?.id) {
      toast({
        variant: "destructive",
        title: "No Quote",
        description: "Please get a quote first.",
      });
      return;
    }

    // Add a 2 second buffer to the expiry time
    const expiryTime = new Date(quote.expires_at).getTime() + 2000;
    if (Date.now() > expiryTime) {
      toast({
        variant: "destructive",
        title: "Quote Expired",
        description: "Please get a new quote.",
      });
      setQuote(null);
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
            platform: parseFloat(amount) * 0.016, // 1.6% platform fee
            processing: parseFloat(amount) * 0.014, // 1.4% processing fee
            total: parseFloat(amount) * 0.03 // 3% total fee
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm swap');
      }

      const { data } = await response.json();
      
      // Show success message
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${amount} ${fromCurrency.toUpperCase()} to ${quote.to_amount} ${toCurrency.toUpperCase()}`,
      });

      // Reset form
      setAmount('');
      setQuote(null);
      setQuotationTimer(0);

      // Trigger balance updates in parent components
      const event = new CustomEvent('balanceUpdate');
      window.dispatchEvent(event);

      // Add a delayed balance refresh
      setTimeout(() => {
        const refreshEvent = new CustomEvent('balanceUpdate');
        window.dispatchEvent(refreshEvent);
      }, 5000); // Refresh again after 5 seconds

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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instant Swap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <div className="flex space-x-2">
              <Select
                value={fromCurrency}
                onValueChange={(value) => {
                  setFromCurrency(value);
                  setQuote(null);
                  setQuotationTimer(0);
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem 
                      key={currency.symbol} 
                      value={currency.symbol}
                      disabled={currency.symbol === toCurrency}
                    >
                      {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setQuote(null);
                  setQuotationTimer(0);
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={switchCurrencies}
              disabled={isLoading}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <div className="flex space-x-2">
              <Select
                value={toCurrency}
                onValueChange={(value) => {
                  setToCurrency(value);
                  setQuote(null);
                  setQuotationTimer(0);
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem 
                      key={currency.symbol} 
                      value={currency.symbol}
                      disabled={currency.symbol === fromCurrency}
                    >
                      {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="You will receive"
                value={quote ? quote.to_amount : ''}
                readOnly
                disabled
              />
            </div>
          </div>

          {quote && (
            <div className="p-4 rounded-lg bg-white border-2 border-primary/20 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-black">Rate</span>
                <span className="font-medium text-black">
                  1 {fromCurrency.toUpperCase()} = {quote.quoted_price} {toCurrency.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-black">You&apos;ll Receive</span>
                <span className="font-medium text-black">
                  {quote.to_amount} {toCurrency.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-black">Quote expires in</span>
                <span className="text-sm font-medium text-black">{quotationTimer}s</span>
              </div>
              {(() => {
                const amount = parseFloat(quote.from_amount);
                const serviceFee = amount * 0.02; // 2% service fee
                const networkFee = amount * 0.01; // 1% network fee
                const totalFee = serviceFee + networkFee;
                
                return (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Service Fee (2%)</span>
                      <span>{serviceFee.toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Network Fee (1%)</span>
                      <span>{networkFee.toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Fee (3%)</span>
                      <span>{totalFee.toFixed(8)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          <div className="pt-4">
            <Button
              className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-100 hover:text-black"
              onClick={quote ? handleSwap : handleGetQuote}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {quote ? 'Processing...' : 'Getting Quote...'}
                </span>
              ) : quote ? (
                <span className="flex items-center gap-2">
                  Confirm Swap
                  <ArrowDownUp className="h-5 w-5" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Get Quote
                  <ArrowDownUp className="h-5 w-5" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 