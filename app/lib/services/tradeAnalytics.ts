import { createClient } from '@supabase/supabase-js';
import { TradeDetails } from '@/app/types/trade';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class TradeAnalyticsService {
  static async getTradingVolume(period: 'daily' | 'monthly' | 'all'): Promise<number> {
    const query = supabase
      .from('trades')
      .select('total')
      .eq('status', 'completed');

    if (period === 'daily') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.gte('created_at', today.toISOString());
    } else if (period === 'monthly') {
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      query.gte('created_at', firstDayOfMonth.toISOString());
    }

    const { data } = await query;
    return data?.reduce((sum, trade) => sum + trade.total, 0) || 0;
  }

  static async getPlatformFees(startDate: Date, endDate: Date): Promise<number> {
    const { data } = await supabase
      .from('trades')
      .select('platform_fee')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    return data?.reduce((sum, trade) => sum + trade.platform_fee, 0) || 0;
  }

  static async getPopularCurrencies(): Promise<{ currency: string; volume: number }[]> {
    const { data } = await supabase
      .from('trades')
      .select('currency, total')
      .eq('status', 'completed');

    if (!data) return [];

    const volumeByCurrency = data.reduce((acc, trade) => {
      acc[trade.currency] = (acc[trade.currency] || 0) + trade.total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(volumeByCurrency)
      .map(([currency, volume]) => ({ currency, volume }))
      .sort((a, b) => b.volume - a.volume);
  }
}

export class TradeAnalytics {
  static calculateTotalVolume(trades: TradeDetails[]): number {
    return trades.reduce((total, trade) => {
      if (trade.status === 'completed') {
        return total + (trade.amount * trade.rate);
      }
      return total;
    }, 0);
  }

  static getSuccessRate(trades: TradeDetails[]): number {
    if (trades.length === 0) return 0;
    const completedTrades = trades.filter(t => t.status === 'completed').length;
    return (completedTrades / trades.length) * 100;
  }

  static getAverageTradeSize(trades: TradeDetails[]): number {
    if (trades.length === 0) return 0;
    const totalAmount = trades.reduce((sum, trade) => sum + trade.amount, 0);
    return totalAmount / trades.length;
  }

  static getTradesByType(trades: TradeDetails[]) {
    return trades.reduce((acc, trade) => ({
      buy: acc.buy + (trade.type === 'buy' ? 1 : 0),
      sell: acc.sell + (trade.type === 'sell' ? 1 : 0)
    }), { buy: 0, sell: 0 });
  }
} 