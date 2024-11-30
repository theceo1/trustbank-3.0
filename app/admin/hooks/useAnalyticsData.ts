import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { AnalyticsData } from '@/app/admin/types/analytics';

interface UseAnalyticsDataProps {
  dateRange: DateRange;
  timeframe: 'daily' | 'weekly' | 'monthly';
}

export function useAnalyticsData({ dateRange, timeframe }: UseAnalyticsDataProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/analytics/users?from=${dateRange.from}&to=${dateRange.to}&timeframe=${timeframe}`);
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateRange, timeframe]);

  return { data, isLoading };
}