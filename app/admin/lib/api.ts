// app/admin/lib/api.ts
import supabase from "@/lib/supabase/client";
import { subDays, format, startOfMonth, endOfMonth, parseISO } from "date-fns";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalReferrals: number;
  totalRevenue: number;
  userGrowth: number;
  activeUserGrowth: number;
  referralGrowth: number;
  revenueGrowth: number;
  chartData: {
    date: string;
    users: number;
    transactions: number;
    revenue: number;
  }[];
  recentActivity: {
    id: string;
    type: 'user' | 'transaction' | 'system' | 'security';
    message: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }[];
  systemHealth: {
    name: string;
    status: 'healthy' | 'warning' | 'critical';
    value: number;
    total?: number;
    unit?: string;
  }[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  const previousThirtyDaysAgo = subDays(thirtyDaysAgo, 30);
  
  // Current period stats
  const { data: currentUsers } = await supabase
    .from('profiles')
    .select('id, created_at, last_active')
    .gte('created_at', thirtyDaysAgo.toISOString());

  const { data: previousUsers } = await supabase
    .from('profiles')
    .select('id')
    .gte('created_at', previousThirtyDaysAgo.toISOString())
    .lt('created_at', thirtyDaysAgo.toISOString());

  // Active users (active in last 7 days)
  const sevenDaysAgo = subDays(today, 7);
  const previousSevenDaysAgo = subDays(sevenDaysAgo, 7);
  
  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('id')
    .gte('last_active', sevenDaysAgo.toISOString());

  const { data: previousActiveUsers } = await supabase
    .from('profiles')
    .select('id')
    .gte('last_active', previousSevenDaysAgo.toISOString())
    .lt('last_active', sevenDaysAgo.toISOString());

  // Revenue calculations
  const { data: currentRevenue } = await supabase
    .from('transactions')
    .select('amount')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('status', 'completed');

  const { data: previousRevenue } = await supabase
    .from('transactions')
    .select('amount')
    .gte('created_at', previousThirtyDaysAgo.toISOString())
    .lt('created_at', thirtyDaysAgo.toISOString())
    .eq('status', 'completed');

  // Calculate growth rates
  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return 100;
    return Number(((current - previous) / previous * 100).toFixed(1));
  };

  const totalUsers = currentUsers?.length || 0;
  const previousTotalUsers = previousUsers?.length || 0;
  const currentActiveUsers = activeUsers?.length || 0;
  const previousActiveUsersCount = previousActiveUsers?.length || 0;
  
  const currentRevenueTotal = currentRevenue?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const previousRevenueTotal = previousRevenue?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  // Generate chart data for the last 30 days
  const chartData = await Promise.all(
    Array.from({ length: 30 }, (_, i) => {
      const date = subDays(today, 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      return supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', `${dateStr}T00:00:00`)
        .lte('created_at', `${dateStr}T23:59:59`)
        .then(({ data }) => ({
          date: dateStr,
          revenue: data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
          transactions: data?.length || 0,
          users: currentUsers?.filter(u => 
            format(new Date(u.created_at), 'yyyy-MM-dd') === dateStr
          ).length || 0
        }));
    })
  );

  // Recent activity
  const { data: activityData } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  // Fetch current period referrals
  const { data: currentReferrals } = await supabase
    .from('referrals')
    .select('id, created_at, status')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('status', 'completed');

  // Fetch previous period referrals
  const { data: previousReferrals } = await supabase
    .from('referrals')
    .select('id, created_at, status')
    .gte('created_at', previousThirtyDaysAgo.toISOString())
    .lt('created_at', thirtyDaysAgo.toISOString())
    .eq('status', 'completed');

  // Calculate referral growth
  const currentReferralCount = currentReferrals?.length || 0;
  const previousReferralCount = previousReferrals?.length || 0;
  const referralGrowth = calculateGrowth(currentReferralCount, previousReferralCount);

  return {
    totalUsers,
    activeUsers: currentActiveUsers,
    totalReferrals: currentReferralCount,
    totalRevenue: currentRevenueTotal,
    userGrowth: calculateGrowth(totalUsers, previousTotalUsers),
    activeUserGrowth: calculateGrowth(currentActiveUsers, previousActiveUsersCount),
    referralGrowth,
    revenueGrowth: calculateGrowth(currentRevenueTotal, previousRevenueTotal),
    chartData,
    recentActivity: activityData?.map(activity => ({
      id: activity.id,
      type: activity.type,
      message: activity.message,
      timestamp: activity.created_at,
      metadata: activity.metadata
    })) || [],
    systemHealth: [
      {
        name: 'API Response Time',
        status: 'healthy',
        value: 250,
        unit: 'ms'
      },
      {
        name: 'Database Status',
        status: 'healthy',
        value: 100,
        unit: '%'
      },
      {
        name: 'Storage Usage',
        status: 'warning',
        value: 85,
        total: 100,
        unit: '%'
      }
    ]
  };
} 