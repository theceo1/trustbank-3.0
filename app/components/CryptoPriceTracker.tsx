import { useEffect, useState } from 'react';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

interface PriceData {
  [key: string]: {
    price: string;
    change: string;
  };
}

export default function CryptoPriceTracker() {
  const [prices, setPrices] = useState<PriceData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const btcData = await QuidaxMarketService.getMarketTicker('btcusdt');
        const ethData = await QuidaxMarketService.getMarketTicker('ethusdt');
        const adaData = await QuidaxMarketService.getMarketTicker('adausdt');

        setPrices({
          bitcoin: {
            price: btcData.ticker.last,
            change: btcData.ticker.price_change_percent
          },
          ethereum: {
            price: ethData.ticker.last,
            change: ethData.ticker.price_change_percent
          },
          cardano: {
            price: adaData.ticker.last,
            change: adaData.ticker.price_change_percent
          }
        });
      } catch (error) {
        console.error('Error fetching prices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading prices...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(prices).map(([coin, data]) => (
        <div key={coin} className="p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold capitalize">{coin}</h3>
          <p className="text-xl">${parseFloat(data.price).toFixed(2)}</p>
          <p className={`text-sm ${parseFloat(data.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {parseFloat(data.change).toFixed(2)}%
          </p>
        </div>
      ))}
    </div>
  );
}
