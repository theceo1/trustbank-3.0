import { useQuery } from '@tanstack/react-query';
import { TradeAnalytics } from '@/app/lib/services/analytics/TradeAnalytics';
import { TradeMetricsData } from '@/app/types/analytics';

export function useTradeMetrics(userId: string) {
  return useQuery<TradeMetricsData>({
    queryKey: ['tradeMetrics', userId],
    queryFn: () => TradeAnalytics.getTradeMetrics(userId),
    select: (data) => ({
      ...data,
      totalVolume: data.totalVolume || 0,
      volumeHistory: data.volumeHistory || [],
      successRateTrend: data.successRateTrend || 0,
      volumeTrend: data.volumeTrend || 0,
      sizeTrend: data.sizeTrend || 0
    })
  });
}