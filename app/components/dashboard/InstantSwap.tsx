"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useToast } from "@/app/components/ui/use-toast";

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
  const [fromCurrency, setFromCurrency] = useState('usdt');
  const [toCurrency, setToCurrency] = useState('sol');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);

  const handleGetQuote = async () => {
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
      const response = await fetch('/api/swap/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_currency: fromCurrency.toUpperCase(),
          to_currency: toCurrency.toUpperCase(),
          from_amount: amount
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get quote');
      }

      const data = await response.json();
      setQuote(data.data);
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
    if (!quote) {
      toast({
        variant: "destructive",
        title: "No Quote",
        description: "Please get a quote first.",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/swap/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quotation_id: quote.id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to confirm swap');
      }

      const data = await response.json();
      toast({
        title: "Swap Successful",
        description: `Successfully swapped ${amount} ${fromCurrency.toUpperCase()} to ${data.data.received_amount} ${toCurrency.toUpperCase()}`,
      });

      // Reset form
      setAmount('');
      setQuote(null);
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
                onValueChange={setFromCurrency}
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
                onValueChange={setToCurrency}
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
            <div className="text-sm space-y-1 text-muted-foreground">
              <div>Rate: 1 {fromCurrency.toUpperCase()} = {quote.quoted_price} {toCurrency.toUpperCase()}</div>
              <div>Expires in: {new Date(quote.expires_at).toLocaleTimeString()}</div>
            </div>
          )}

          <div className="pt-4">
            <Button
              className="w-full"
              onClick={quote ? handleSwap : handleGetQuote}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {quote ? 'Confirm Swap' : 'Get Quote'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 