export interface TimeSeriesData {
  date: string;
  count: number;
  activeUsers: number;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  growth: number;
  retention: number;
  usersByTime: TimeSeriesData[];
}

export interface AnalyticsData {
  userMetrics: UserMetrics;
}