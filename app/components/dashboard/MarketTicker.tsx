"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface MarketData {
  name: string;
  base_unit: string;
  quote_unit: string;
  low: string;
  high: string;
  last: string;
  volume: string;
  change: string;
}

export function MarketTicker() {
  const [markets, setMarkets] = useState<Record<string, MarketData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setError(null);
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/market/tickers`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }

        const data = await response.json();
        if (data.status === 'success' && data.data?.tickers) {
          setMarkets(data.data.tickers);
        } else {
          throw new Error('Invalid market data received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        console.error('Error fetching market data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (value: string, decimals: number = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatChange = (change: string) => {
    const num = parseFloat(change);
    return isNaN(num) ? '0' : (num > 0 ? '+' : '') + num.toFixed(2);
  };

  const getChangeColor = (change: string) => {
    const num = parseFloat(change);
    if (isNaN(num)) return 'text-muted-foreground';
    return num > 0 ? 'text-green-500' : num < 0 ? 'text-red-500' : 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const topMarkets = Object.entries(markets)
    .filter(([pair]) => pair.endsWith('ngn'))
    .sort(([, a], [, b]) => parseFloat(b.volume) - parseFloat(a.volume))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pair</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>24h Change</TableHead>
              <TableHead className="text-right">24h Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topMarkets.map(([pair, data]) => (
              <TableRow key={pair}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {data.base_unit.toUpperCase()}/{data.quote_unit.toUpperCase()}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>₦{formatNumber(data.last)}</TableCell>
                <TableCell>
                  <span className={getChangeColor(data.change)}>
                    {formatChange(data.change)}%
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  ₦{formatNumber(data.volume)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 