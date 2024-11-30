import { useState, useEffect, useCallback } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
const API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd&include_24hr_change=true&x_cg_demo_api_key=${API_KEY}`;

interface PriceData {
  [key: string]: number;
}

interface CoinGeckoResponse {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
  };
  ethereum: {
    usd: number;
    usd_24h_change: number;
  };
  tether: {
    usd: number;
    usd_24h_change: number;
  };
}

const calculatePriceChange = (currentPrice: number, previousPrice: number): number => {
  if (!previousPrice) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
};

export function useCryptoWebSocket() {
  const [prices, setPrices] = useState<PriceData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [previousPrices, setPreviousPrices] = useState<PriceData>({});

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CoinGeckoResponse = await response.json();
      
      setPreviousPrices(prices);
      setPrices(prevPrices => ({
        BTCUSDT: data.bitcoin.usd,
        ETHUSDT: data.ethereum.usd,
        USDTUSDT: data.tether.usd,
        BTCUSDT_24h_change: data.bitcoin.usd_24h_change,
        ETHUSDT_24h_change: data.ethereum.usd_24h_change,
        USDTUSDT_24h_change: data.tether.usd_24h_change,
        BTCUSDT_prev: prevPrices.BTCUSDT || data.bitcoin.usd,
        ETHUSDT_prev: prevPrices.ETHUSDT || data.ethereum.usd,
        USDTUSDT_prev: prevPrices.USDTUSDT || data.tether.usd,
      }));
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setIsConnected(false);
    }
  }, [prices]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, isConnected };
}
