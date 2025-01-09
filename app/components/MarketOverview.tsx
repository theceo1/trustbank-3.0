import { useEffect, useState } from 'react';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

interface MarketData {
  volume: string;
  high: string;
  low: string;
  last: string;
  change: string;
}

export default function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await QuidaxMarketService.getAllMarketTickers();
        const btcData = response.data['btcusdt'];
        
        if (btcData) {
          setMarketData({
            volume: btcData.ticker.vol,
            high: btcData.ticker.high,
            low: btcData.ticker.low,
            last: btcData.ticker.last,
            change: ((parseFloat(btcData.ticker.last) - parseFloat(btcData.ticker.open)) / 
                    parseFloat(btcData.ticker.open) * 100).toFixed(2)
          });
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading market data...</div>;
  }

  if (!marketData) {
    return <div>Failed to load market data</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">24h Volume</h3>
        <p className="text-lg font-bold">
          {new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 2
          }).format(parseFloat(marketData.volume))}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">24h High</h3>
        <p className="text-lg font-bold">
          {new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 2
          }).format(parseFloat(marketData.high))}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">24h Low</h3>
        <p className="text-lg font-bold">
          {new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 2
          }).format(parseFloat(marketData.low))}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">24h Change</h3>
        <p className={`text-lg font-bold ${parseFloat(marketData.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {parseFloat(marketData.change) >= 0 ? '+' : ''}{marketData.change}%
        </p>
      </div>
    </div>
  );
} 