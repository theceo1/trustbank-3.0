// app/hooks/use-market.ts

import { useState, useEffect } from 'react';
import { CryptoData, TimeFrame, CryptoHistoricalData } from '@/app/types/market';

export function useMarketData() {
  const [data, setData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/market-data');
        if (!response.ok) throw new Error('Failed to fetch market data');
        const marketData = await response.json();
        setData(marketData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error };
}

export function useHistoricalData(symbol: string, timeframe: TimeFrame) {
  const [data, setData] = useState<CryptoHistoricalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/crypto/history?symbol=${symbol}&timeframe=${timeframe}`
        );
        if (!response.ok) throw new Error('Failed to fetch historical data');
        const historicalData = await response.json();
        setData(historicalData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch historical data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, timeframe]);

  return { data, isLoading, error };
}

export function useCryptoPrice(symbol: string) {
  const [price, setPrice] = useState<number>(0);
  const [change24h, setChange24h] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/crypto/prices?symbol=${symbol}`);
        if (!response.ok) throw new Error('Failed to fetch price data');
        const data = await response.json();
        setPrice(data.price);
        setChange24h(data.change24h);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch price data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [symbol]);

  return { price, change24h, isLoading, error };
}