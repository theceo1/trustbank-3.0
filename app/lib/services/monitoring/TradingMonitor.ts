import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

export class TradingMonitor {
  private static supabase = createClientComponentClient<Database>();

  static async getSystemStatus() {
    const { data: metrics } = await this.supabase.rpc('get_system_metrics');
    
    return {
      paymentSuccess: metrics.payment_success_rate,
      averageProcessingTime: metrics.avg_processing_time,
      systemUptime: metrics.uptime,
      activeUsers: metrics.active_users_count
    };
  }

  static async getUserMetrics(userId: string) {
    const { data: metrics } = await this.supabase.rpc('get_user_metrics', {
      p_user_id: userId
    });

    return {
      totalTrades: metrics.total_trades,
      successfulTrades: metrics.successful_trades,
      tradingVolume: metrics.trading_volume,
      averageTradeSize: metrics.avg_trade_size
    };
  }
}