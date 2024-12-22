import { useEffect, useState } from 'react';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

interface MarketData {
  volume: string;
  high: string;
  low: string;
  last: string;
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await QuidaxMarketService.getMarketTicker();
        setMarketData({
          volume: data.ticker.volume,
          high: data.ticker.high,
          low: data.ticker.low,
          last: data.ticker.last
        });
      } catch (error) {
        console.error('Error fetching market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!marketData) {
    return <div>Loading market data...</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">24h Volume</h3>
        <p className="text-lg font-semibold">{parseFloat(marketData.volume).toFixed(2)} BTC</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">24h High</h3>
        <p className="text-lg font-semibold">₦{parseFloat(marketData.high).toLocaleString()}</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">24h Low</h3>
        <p className="text-lg font-semibold">₦{parseFloat(marketData.low).toLocaleString()}</p>
      </div>
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Last Price</h3>
        <p className="text-lg font-semibold">₦{parseFloat(marketData.last).toLocaleString()}</p>
      </div>
    </div>
  );
} 