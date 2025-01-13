"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ArrowDown, ArrowUp } from 'lucide-react';

interface MarketData {
  name: string;
  last: string;
  volume: string;
  price_change_percent: number;
}

export function MarketStats() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market/tickers');
        if (!response.ok) throw new Error('Failed to fetch market data');
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          const formattedData = Object.entries(data.data).map(([name, marketData]: [string, any]) => {
            const ticker = marketData.ticker;
            const open = parseFloat(ticker.open);
            const last = parseFloat(ticker.last);
            const priceChange = open > 0 ? ((last - open) / open) * 100 : 0;
            
            return {
              name,
              last: ticker.last,
              volume: ticker.volume,
              price_change_percent: priceChange
            };
          });
          setMarketData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-orange-100">
      <CardHeader>
        <CardTitle className="text-black">Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-background/50 rounded-lg p-4">
                <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                <div className="h-6 bg-muted rounded w-32"></div>
              </div>
            ))
          ) : (
            marketData.slice(0, 6).map((market) => (
              <div key={market.name} className="bg-background rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{market.name.toUpperCase()}</span>
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    market.price_change_percent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {market.price_change_percent >= 0 ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    {Math.abs(market.price_change_percent).toFixed(2)}%
                  </span>
                </div>
                <div className="text-lg font-bold">{formatNumber(parseFloat(market.last))}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Vol: {formatNumber(parseFloat(market.volume))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}