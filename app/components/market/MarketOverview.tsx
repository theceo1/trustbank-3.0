import { useEffect, useState } from 'react';
import { MarketService } from '@/app/lib/services/market';
import { MarketOverview as MarketOverviewType } from '@/app/types/market';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/app/lib/utils/format';

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketOverviewType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await MarketService.getMarketOverview();
        setMarketData(data);
      } catch (error) {
        console.error('Failed to fetch market overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (loading) {
    return <p>Loading market overview...</p>;
  }

  if (!marketData) {
    return <p>Failed to load market data.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Market Cap</p>
            <p className="text-lg font-bold">{formatCurrency(marketData.totalMarketCap, 'USD', true)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <p className="text-lg font-bold">{formatCurrency(marketData.totalVolume24h, 'USD', true)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">BTC Dominance</p>
            <p className="text-lg font-bold">{formatPercentage(marketData.btcDominance)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Market Cap Change (24h)</p>
            <p className={`text-lg font-bold ${marketData.marketCapChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(marketData.marketCapChange24h)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}