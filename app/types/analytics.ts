export interface TradeMetricsData {
  totalTrades: number;
  totalVolume: number;
  successRate: number;
  averageTradeSize: number;
  volumeHistory: Array<{
    date: string;
    volume: number;
  }>;
  successRateTrend: number;
  volumeTrend: number;
  sizeTrend: number;
  recentTrades: any[];
} 