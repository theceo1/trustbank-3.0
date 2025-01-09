import { useEffect, useState } from 'react';
import { MarketService, getMarketService } from '@/app/lib/services/market';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MarketData {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  marketCapChange24h: number;
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const marketService = getMarketService();
        const response = await marketService.getAllMarketRates();
        
        if (response.status === 'success' && response.data) {
          const btcData = response.data['btcusdt'];
          const totalVolume = Object.values(response.data)
            .reduce((sum, market) => sum + parseFloat(market.volume || '0'), 0);
          
          setMarketData({
            totalMarketCap: parseFloat(btcData?.last || '0') * 21000000, // Approximate total BTC supply
            totalVolume24h: totalVolume,
            btcDominance: 40, // Fixed value as we don't have real-time data
            marketCapChange24h: parseFloat(btcData?.change || '0')
          });
        }
      } catch (error) {
        console.error('Failed to fetch market overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute

    return () => clearInterval(interval);
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
            <p className="text-lg font-bold">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 2
              }).format(marketData.totalMarketCap)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <p className="text-lg font-bold">
              {new Intl.NumberFormat('en-US', { 
                style: 'currency', 
                currency: 'USD',
                notation: 'compact',
                maximumFractionDigits: 2
              }).format(marketData.totalVolume24h)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">BTC Dominance</p>
            <p className="text-lg font-bold">{marketData.btcDominance.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Market Cap Change (24h)</p>
            <p className={`text-lg font-bold ${marketData.marketCapChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marketData.marketCapChange24h >= 0 ? '+' : ''}{marketData.marketCapChange24h.toFixed(2)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}