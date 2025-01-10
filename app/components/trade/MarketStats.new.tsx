"use client";

import { useEffect, useState } from 'react';

interface MarketStats {
  data: {
    [key: string]: {
      last: string;
      high: string;
      low: string;
      volume: string;
      volume_traded: string;
      change: string;
    };
  };
}

export default function MarketStats() {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async () => {
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
      if (!baseUrl) {
        throw new Error('Base URL is not available');
      }

      const apiUrl = new URL('/api/market/tickers', baseUrl).toString();
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      if (data.status === 'success') {
        setStats(data);
      } else {
        throw new Error(data.error || 'Failed to fetch market data');
      }
    } catch (err) {
      console.error('[Market Stats]', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading market stats...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!stats?.data) {
    return <div>No market data available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(stats.data).map(([market, data]) => (
        <div key={market} className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">{market.toUpperCase()}</h3>
          <div className="mt-2 space-y-1">
            <p>Last: {data.last}</p>
            <p>High: {data.high}</p>
            <p>Low: {data.low}</p>
            <p>Volume: {data.volume}</p>
            <p>Change: {data.change}%</p>
          </div>
        </div>
      ))}
    </div>
  );
} 