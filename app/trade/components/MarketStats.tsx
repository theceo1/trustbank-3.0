"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatNumber, formatCurrency } from '@/app/lib/utils';
import { ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MarketStats {
  buy: string;
  sell: string;
  low: string;
  high: string;
  last: string;
  volume: string;
  change: string;
  base_unit: string;
  quote_unit: string;
}

export function MarketStats() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/market/tickers/btcngn');
        if (!response.ok) {
          throw new Error('Failed to fetch market stats');
        }
        const data = await response.json();
        if (data.status === 'success') {
          setStats(data.data);
          setError(null);
        } else {
          throw new Error(data.message || 'Failed to fetch market stats');
        }
      } catch (err) {
        console.error('Market stats error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch market stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketStats();
    // Fetch every 10 seconds
    const interval = setInterval(fetchMarketStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full bg-white dark:bg-gray-800/50 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold dark:text-white">Market Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-white dark:bg-gray-800/50 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold dark:text-white">Market Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 dark:text-red-400">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const changePercent = parseFloat(stats.change);
  const isPositiveChange = changePercent >= 0;
  const volume24h = parseFloat(stats.volume);
  const lastPrice = parseFloat(stats.last);
  const volumeInNGN = volume24h * lastPrice;
  const baseUnit = stats?.base_unit?.toUpperCase() || 'BTC';
  const quoteUnit = stats?.quote_unit?.toUpperCase() || 'NGN';

  return (
    <Card className="w-full bg-white dark:bg-gray-800/50 border-none shadow-lg">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold dark:text-white flex items-center gap-2">
            Market Stats
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>24-hour market statistics for {baseUnit}/{quoteUnit}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="flex items-center gap-2">
            {isPositiveChange ? (
              <ArrowUpCircle className="h-5 w-5 text-green-500" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-lg font-semibold ${isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositiveChange ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <CardDescription>
          Last updated: {new Date().toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Price</p>
            <p className="text-lg font-semibold">{formatCurrency(lastPrice, 'NGN')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume ({baseUnit})</p>
            <p className="text-lg font-semibold">{formatNumber(volume24h, 4)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">24h High</p>
            <p className="text-lg font-semibold">{formatCurrency(parseFloat(stats.high), 'NGN')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Low</p>
            <p className="text-lg font-semibold">{formatCurrency(parseFloat(stats.low), 'NGN')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Buy Price</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{formatCurrency(parseFloat(stats.buy), 'NGN')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sell Price</p>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatCurrency(parseFloat(stats.sell), 'NGN')}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">24h Volume (NGN)</p>
            <p className="text-lg font-semibold">{formatCurrency(volumeInNGN, 'NGN')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 