import { useEffect, useState } from 'react';
import { QuidaxMarketService } from '@/app/lib/services/quidax-market';

interface CryptoPrice {
  symbol: string;
  price: string;
  change24h: string;
}

export default function CryptoPriceTracker() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const marketData = await QuidaxMarketService.getAllMarketTickers();
        const tickers = marketData.data;

        const cryptoPrices: CryptoPrice[] = [
          {
            symbol: 'BTC/USDT',
            price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
              .format(parseFloat(tickers['btcusdt']?.ticker.last || '0')),
            change24h: ((parseFloat(tickers['btcusdt']?.ticker.last || '0') - 
                        parseFloat(tickers['btcusdt']?.ticker.open || '0')) / 
                        parseFloat(tickers['btcusdt']?.ticker.open || '1') * 100).toFixed(2)
          },
          {
            symbol: 'ETH/USDT',
            price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
              .format(parseFloat(tickers['ethusdt']?.ticker.last || '0')),
            change24h: ((parseFloat(tickers['ethusdt']?.ticker.last || '0') - 
                        parseFloat(tickers['ethusdt']?.ticker.open || '0')) / 
                        parseFloat(tickers['ethusdt']?.ticker.open || '1') * 100).toFixed(2)
          },
          {
            symbol: 'ADA/USDT',
            price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
              .format(parseFloat(tickers['adausdt']?.ticker.last || '0')),
            change24h: ((parseFloat(tickers['adausdt']?.ticker.last || '0') - 
                        parseFloat(tickers['adausdt']?.ticker.open || '0')) / 
                        parseFloat(tickers['adausdt']?.ticker.open || '1') * 100).toFixed(2)
          }
        ];

        setPrices(cryptoPrices);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching crypto prices:', err);
        setError('Failed to fetch prices');
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

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {prices.map((crypto) => (
        <div key={crypto.symbol} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold">{crypto.symbol}</h3>
          <p className="text-2xl font-bold mt-2">{crypto.price}</p>
          <p className={`mt-1 ${parseFloat(crypto.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {parseFloat(crypto.change24h) >= 0 ? '+' : ''}{crypto.change24h}%
          </p>
        </div>
      ))}
    </div>
  );
}
