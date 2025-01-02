"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  orderBook?: {
    asks: [string, string][];
    bids: [string, string][];
  };
}

const TRADING_PAIRS = [
  { symbol: 'btc', name: 'Bitcoin' },
  { symbol: 'eth', name: 'Ethereum' },
  { symbol: 'usdt', name: 'Tether' },
  { symbol: 'usdc', name: 'USD Coin' },
  { symbol: 'bnb', name: 'BNB' },
  { symbol: 'xrp', name: 'XRP' },
];

export function CryptoTradeCard() {
  const { toast } = useToast();
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [amount, setAmount] = useState('');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeLoading, setTradeLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    const fetchMarketData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/market/prices?market=${selectedCrypto}ngn&orderBook=true`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || 'Failed to fetch market data');
        }

        const data = await response.json();
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('No market data available');
        }

        if (isSubscribed) {
          setMarketData(data[0]);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to fetch market data. Please try again later.');
          console.error('Error fetching market data:', err);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [selectedCrypto]);

  const handleTrade = async (action: 'buy' | 'sell') => {
    if (!amount || !marketData || parseFloat(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to trade.',
      });
      return;
    }

    try {
      setTradeLoading(true);
      // Add trade logic here
      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: `${selectedCrypto}ngn`,
          side: action,
          amount: parseFloat(amount),
          price: getBestPrice(action)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to place trade');
      }

      const data = await response.json();
      toast({
        title: 'Trade Initiated',
        description: `${action.toUpperCase()} order placed for ${amount} ${selectedCrypto.toUpperCase()}`,
      });

      // Reset amount after successful trade
      setAmount('');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Trade Failed',
        description: err instanceof Error ? err.message : 'Failed to place trade. Please try again.',
      });
    } finally {
      setTradeLoading(false);
    }
  };

  const getBestPrice = (action: 'buy' | 'sell'): number => {
    if (!marketData?.orderBook) return marketData?.price || 0;
    
    const orders = action === 'buy' ? marketData.orderBook.asks : marketData.orderBook.bids;
    return orders.length > 0 ? parseFloat(orders[0][0]) : marketData.price;
  };

  const getEstimatedValue = (): string => {
    if (!amount || !marketData || isNaN(parseFloat(amount))) return '0.00';
    const price = marketData.price;
    return (parseFloat(amount) * price).toFixed(2);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Quick Trade</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <Select
            value={selectedCrypto}
            onValueChange={setSelectedCrypto}
            disabled={loading || tradeLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select cryptocurrency" />
            </SelectTrigger>
            <SelectContent>
              {TRADING_PAIRS.map((pair) => (
                <SelectItem key={pair.symbol} value={pair.symbol}>
                  {pair.name} ({pair.symbol.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col space-y-2">
            <Input
              type="number"
              placeholder={`Amount in ${selectedCrypto.toUpperCase()}`}
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                  setAmount(value);
                }
              }}
              disabled={loading || tradeLoading}
              min="0"
              step="any"
            />
            <div className="text-sm text-muted-foreground">
              ≈ ₦{getEstimatedValue()} NGN
            </div>
          </div>

          {marketData && (
            <div className="text-sm space-y-1">
              <div>Current Price: ₦{marketData.price.toFixed(2)}</div>
              <div className={cn(
                marketData.change24h > 0 ? 'text-green-600' : 'text-red-600'
              )}>
                24h Change: {marketData.change24h > 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
              </div>
              <div>24h High: ₦{marketData.high24h.toFixed(2)}</div>
              <div>24h Low: ₦{marketData.low24h.toFixed(2)}</div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              className="flex-1"
              onClick={() => handleTrade('buy')}
              disabled={loading || tradeLoading || !amount || parseFloat(amount) <= 0}
            >
              {(loading || tradeLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buy {selectedCrypto.toUpperCase()}
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleTrade('sell')}
              disabled={loading || tradeLoading || !amount || parseFloat(amount) <= 0}
              variant="outline"
            >
              {(loading || tradeLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sell {selectedCrypto.toUpperCase()}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 