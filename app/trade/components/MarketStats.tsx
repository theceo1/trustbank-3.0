"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CryptoData {
  current_price: number;
  price_change_percentage_24h: number;
  symbol: string;
}

export function MarketStats() {
  const [marketData, setMarketData] = useState<Record<string, CryptoData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether&order=market_cap_desc'
        );
        
        if (!response.ok) throw new Error('Failed to fetch market data');
        
        const data = await response.json();
        const formattedData = data.reduce((acc: Record<string, CryptoData>, coin: any) => {
          acc[coin.symbol] = {
            current_price: coin.current_price,
            price_change_percentage_24h: coin.price_change_percentage_24h,
            symbol: coin.symbol
          };
          return acc;
        }, {});
        
        setMarketData(formattedData);
        setError(null);
      } catch (err) {
        setError('Failed to load market data');
        console.error('Failed to fetch market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(marketData).map(([symbol, data]) => (
          <div key={symbol} className="p-4 rounded-lg border bg-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{symbol.toUpperCase()}</p>
              {data.price_change_percentage_24h > 0 ? 
                <TrendingUp className="h-4 w-4 text-green-500" /> : 
                <TrendingDown className="h-4 w-4 text-red-500" />
              }
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(data.current_price)}</p>
            <p className={`text-sm ${data.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {data.price_change_percentage_24h > 0 ? '+' : ''}
              {data.price_change_percentage_24h.toFixed(2)}%
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}