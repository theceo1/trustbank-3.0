"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
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

export default function MarketStats() {
  const [data, setData] = useState<Record<string, MarketData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await QuidaxMarketService.getAllMarketTickers();
      const marketData: Record<string, MarketData> = {};
      
      // Filter for USDT and NGN pairs
      Object.entries(response.data).forEach(([market, data]) => {
        if (data.quote_unit === 'usdt' || data.quote_unit === 'ngn') {
          marketData[market] = {
            ticker: {
              name: data.name,
              base_unit: data.base_unit,
              quote_unit: data.quote_unit,
              ...data.ticker
            }
          };
        }
      });

      setData(marketData);
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
  }, []);

  const getTopGainers = () => {
    if (!data) return [];
    return Object.entries(data)
      .map(([market, { ticker }]) => ({
        market,
        name: ticker.name,
        change: ((parseFloat(ticker.last) - parseFloat(ticker.open)) / parseFloat(ticker.open)) * 100,
        price: parseFloat(ticker.last),
        quote_unit: ticker.quote_unit
      }))
      .filter(({ change }) => !isNaN(change))
      .sort((a, b) => b.change - a.change)
      .slice(0, 3);
  };

  const getTopVolume = () => {
    if (!data) return [];
    return Object.entries(data)
      .map(([market, { ticker }]) => ({
        market,
        name: ticker.name,
        volume: parseFloat(ticker.vol) * parseFloat(ticker.last),
        price: parseFloat(ticker.last),
        quote_unit: ticker.quote_unit
      }))
      .filter(({ volume }) => !isNaN(volume))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3);
  };

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
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Market Overview
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
      <CardContent className="space-y-6 relative">
        {loading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : data ? (
          <>
            <div className="relative">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Gainers</h3>
              <div className="space-y-2 relative">
                {getTopGainers().map(({ market, name, change, price, quote_unit }) => (
                  <div key={market} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{market.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(price, quote_unit)}</p>
                      <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-end`}>
                        {change >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Top Volume</h3>
              <div className="space-y-2">
                {getTopVolume().map(({ market, name, volume, price, quote_unit }) => (
                  <div key={market} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-muted-foreground">{market.toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(price, quote_unit)}</p>
                      <p className="text-sm text-muted-foreground">
                        Vol: {formatCurrency(volume, quote_unit)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
} 