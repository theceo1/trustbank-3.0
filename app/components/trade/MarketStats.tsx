"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MarketStats {
  data: {
    market_cap_percentage: {
      [key: string]: number;
    };
    total_market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    market_cap_change_percentage_24h_usd: number;
  };
}

export default function MarketStats() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const response = await fetch(`${baseUrl}/api/market/stats`);
        if (!response.ok) {
          throw new Error('Failed to fetch market stats');
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market stats');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            Failed to load market statistics. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats?.data) {
    return null;
  }

  const {
    market_cap_percentage,
    total_market_cap,
    total_volume,
    market_cap_change_percentage_24h_usd
  } = stats.data;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Market Overview</h3>
            <p className="text-sm text-gray-500">
              Total Market Cap: ${total_market_cap.usd.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              24h Volume: ${total_volume.usd.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              24h Change: {market_cap_change_percentage_24h_usd.toFixed(2)}%
            </p>
          </div>
          <div>
            <h4 className="text-md font-semibold">Market Dominance</h4>
            <div className="space-y-2">
              {Object.entries(market_cap_percentage)
                .slice(0, 5)
                .map(([coin, percentage]) => (
                  <p key={coin} className="text-sm text-gray-500">
                    {coin.toUpperCase()}: {percentage.toFixed(2)}%
                  </p>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 