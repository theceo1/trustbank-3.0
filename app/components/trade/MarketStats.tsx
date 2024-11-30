import { useEffect, useState } from 'react';
import { QuidaxService } from '@/app/lib/services/quidax';
import { MarketStats as MarketStatsType } from '@/app/types/market';

interface DisplayMarketData {
  last_price: string;
  price_change_24h: number;
}

export default function MarketStats() {
  const [marketData, setMarketData] = useState<DisplayMarketData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await QuidaxService.getMarketStats('btc_ngn');
        if (!data) {
          throw new Error('No market data received');
        }
        
        // Transform the MarketStats data into DisplayMarketData
        const displayData: DisplayMarketData = {
          last_price: data.ticker.last,
          price_change_24h: Number(data.ticker.change)
        };
        
        setMarketData(displayData);
        setError(null);
      } catch (err) {
        setError('Failed to load market data');
        console.error('Failed to fetch market data:', err);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  if (!marketData) {
    return <div className="animate-pulse">Loading market data...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Market Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600">Last Price</p>
          <p className="text-xl font-bold">₦{marketData.last_price}</p>
        </div>
        <div>
          <p className="text-gray-600">24h Change</p>
          <p className={`text-xl font-bold ${marketData.price_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {marketData.price_change_24h}%
          </p>
        </div>
      </div>
    </div>
  );
}