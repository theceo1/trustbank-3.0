//app/components/trade/MarketStats.tsx

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { QuidaxMarketService } from '../../lib/services/quidax-market';

interface MarketData {
  ticker: {
    name: string;
    base_unit: string;
    quote_unit: string;
    low: string;
    high: string;
    last: string;
    vol: string;
    buy: string;
    sell: string;
    open: string;
  };
}

interface MarketTickerData {
  name: string;
  base_unit: string;
  quote_unit: string;
  ticker: {
    low: string;
    high: string;
    last: string;
    vol: string;
    buy: string;
    sell: string;
    open: string;
  };
}

interface MarketTickersResponse {
  status: string;
  message: string;
  data: Record<string, MarketTickerData>;
}

export default function MarketStats({ market = 'btcngn' }) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await QuidaxMarketService.getAllMarketTickers();
      const marketData = response.data[market];
      
      if (marketData) {
        setData({ ticker: {
          name: marketData.name,
          base_unit: marketData.base_unit,
          quote_unit: marketData.quote_unit,
          ...marketData.ticker
        }});
      } else {
        throw new Error('Market data not available');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch market data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [market]);

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-destructive text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMarketData}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Market Stats
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMarketData}
          className="h-8 w-8 p-0"
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : data ? (
          <>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Last Price</p>
              <p className="text-2xl font-bold">
                {formatCurrency(parseFloat(data.ticker.last))}
              </p>
              <div className={`flex items-center text-sm ${
                parseFloat(data.ticker.sell) >= parseFloat(data.ticker.buy)
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {parseFloat(data.ticker.sell) >= parseFloat(data.ticker.buy) ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(((parseFloat(data.ticker.sell) - parseFloat(data.ticker.buy)) / parseFloat(data.ticker.buy)) * 100).toFixed(2)}%
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">24h High</p>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(parseFloat(data.ticker.high))}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">24h Low</p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(parseFloat(data.ticker.low))}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p className="text-2xl font-bold">
                {formatNumber(parseFloat(data.ticker.vol))} {data.ticker.base_unit.toUpperCase()}
              </p>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}