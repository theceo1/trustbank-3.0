import { TimeframeType } from '../hooks/useAnalyticsData';

export interface UserAnalyticsProps {
  data: {
    totalUsers: number;
    activeUsers: number;
    growth: number;
    retention: number;
    usersByTime: Array<{ date: string; count: number }>;
  };
  timeframe: TimeframeType;
}

export interface ReferralAnalyticsProps {
  data: {
    totalReferrals: number;
    activeReferrers: number;
    conversionRate: number;
    averageCommission: number;
    referralsByTier: Record<string, number>;
    topReferrers: Array<{
      id: string;
      name: string;
      count: number;
      tier: string;
    }>;
    referralsByTime: Array<{ date: string; count: number }>;
  };
  timeframe: TimeframeType;
}

export interface TransactionAnalyticsProps {
  data: {
    totalTransactions: number;
    totalVolume: number;
    averageTransaction: number;
    successRate: number;
    transactionsByStatus: Record<string, number>;
    transactionsByTime: Array<{ date: string; amount: number }>;
  };
  timeframe: TimeframeType;
}