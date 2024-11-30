// Date Range Type
export interface DateRange {
    from: Date;
    to: Date;
  }
  
  // Analytics Event Types
  export interface AnalyticsEvent {
    id: string;
    event_type: string;
    user_id: string;
    metadata: Record<string, any>;
    created_at: string;
  }
  
  // Metrics Types
  export interface UserMetrics {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
    retentionRate: number;
    usersByTime: TimeSeriesData[];
  }
  
  export interface ReferralMetrics {
    totalReferrals: number;
    activeReferrers: number;
    conversionRate: number;
    referralsByTier: ReferralTierData[];
    topReferrers: ReferrerData[];
    referralsByTime: TimeSeriesData[];
  }
  
  export interface TransactionMetrics {
    totalTransactions: number;
    totalVolume: number;
    averageTransaction: number;
    transactionsByStatus: TransactionStatusData[];
    transactionsByTime: TimeSeriesData[];
  }
  
  // Data Structure Types
  export interface TimeSeriesData {
    date: string;
    value: number;
  }
  
  export interface ReferralTierData {
    tier: string;
    count: number;
    earnings: number;
  }
  
  export interface ReferrerData {
    id: string;
    name: string;
    referral_count: number;
    earnings: number;
    tier: string;
  }
  
  export interface TransactionStatusData {
    status: string;
    count: number;
    volume: number;
  }
  
  // Component Props Types
  export interface MetricsCardProps {
    title: string;
    value: number | string;
    change: number;
    changeLabel: string;
    icon?: React.ReactNode;
  }
  
  export interface TrendChartProps {
    title: string;
    data: TimeSeriesData[];
    dataKey: string;
    type: 'line' | 'area';
    color?: string;
    height?: number;
  }
  
  export interface ComparisonChartProps {
    title: string;
    data: any[];
    metrics: {
      key: string;
      name: string;
      color: string;
    }[];
    xAxisKey: string;
  }
  
  // Export Types
  export interface ExportOptions {
    format: 'csv' | 'xlsx' | 'pdf' | 'json';
    dateRange: DateRange;
    includeMetrics: string[];
    styling?: {
      theme?: 'light' | 'dark';
      colors?: string[];
      logo?: string;
    };
    customHeaders?: Record<string, string>;
    filters?: Record<string, any>;
  }