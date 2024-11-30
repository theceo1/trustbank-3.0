// app/hooks/use-crypto-websocket.ts
import { useState, useEffect, useCallback } from 'react';
import { CryptoData } from '@/app/types/market';

export function useCryptoWebSocket() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isConnected, setIsConnected] = useState(false);

  const fetchPrices = useCallback(async () => {
    try {
      const response = await fetch('/api/crypto/prices');
      if (!response.ok) throw new Error('Failed to fetch prices');
      const data = await response.json();
      setPrices(data);
      setIsConnected(true);
    } catch (error) {
      console.error('Error fetching prices:', error);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { prices, isConnected };
}