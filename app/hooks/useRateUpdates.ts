import { useState, useEffect, useCallback } from 'react';
import { MarketRateService } from '@/app/lib/services/market-rate';

interface UseRateUpdatesProps {
  cryptoCurrency: string;
  onRateExpired?: () => void;
}

export function useRateUpdates({ cryptoCurrency, onRateExpired }: UseRateUpdatesProps) {
  const [rate, setRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  const fetchInitialRate = useCallback(async () => {
    if (!cryptoCurrency) return;

    setIsLoading(true);
    setError(null);

    try {
      const rateResponse = await MarketRateService.getRate({
        amount: 1,
        currency_pair: `${cryptoCurrency.toLowerCase()}_ngn`,
        type: 'buy'
      });
      setRate(rateResponse.rate);
      setLastUpdateTime(Date.now());
    } catch (err) {
      setError('Failed to fetch initial rate');
      console.error('Rate fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cryptoCurrency]);

  useEffect(() => {
    fetchInitialRate();
    const RATE_EXPIRY_TIME = 5 * 60 * 1000;
    const REFRESH_INTERVAL = 30000; // 30 seconds

    const refreshInterval = setInterval(fetchInitialRate, REFRESH_INTERVAL);

    const expiryCheck = setInterval(() => {
      const timeSinceUpdate = Date.now() - lastUpdateTime;
      if (timeSinceUpdate > RATE_EXPIRY_TIME) {
        onRateExpired?.();
        fetchInitialRate();
      }
    }, 60000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(expiryCheck);
    };
  }, [cryptoCurrency, fetchInitialRate, lastUpdateTime, onRateExpired]);

  const refreshRate = useCallback(() => {
    fetchInitialRate();
  }, [fetchInitialRate]);

  return {
    rate,
    isLoading,
    error,
    refreshRate,
    lastUpdateTime
  };
}