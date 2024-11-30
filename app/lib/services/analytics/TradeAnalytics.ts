import { TradeMetricsData } from '@/app/types/analytics';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

export class TradeAnalytics {
  private static supabase = createClientComponentClient<Database>();

  static async getTradeMetrics(userId: string): Promise<TradeMetricsData> {
    const { data, error } = await this.supabase.rpc('get_trade_metrics', {
      p_user_id: userId
    });

    if (error) throw error;

    return {
      totalTrades: data.total_trades,
      totalVolume: data.total_volume,
      successRate: data.success_rate,
      averageTradeSize: data.average_amount,
      volumeHistory: data.volume_history || [],
      successRateTrend: data.success_rate_trend || 0,
      volumeTrend: data.volume_trend || 0,
      sizeTrend: data.size_trend || 0,
      recentTrades: data.recent_trades || []
    };
  }

  async getUserMetrics(userId: string) {
    return {
      totalTrades: 0,
      successRate: 0,
      averageAmount: 0,
      recentTrades: []
    };
  }
}