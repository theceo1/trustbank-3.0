// app/admin/lib/api.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

interface Transaction {
  amount: number;
  created_at: string;
}

interface User {
  id: string;
  created_at: string;
}

interface Activity {
  type: string;
  created_at: string;
}

interface ChartData {
  date: string;
  revenue: number;
  users: number;
}

export async function getAdminDashboardData() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get current date and date 30 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const previousThirtyDays = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Format dates for database queries
  const currentDate = now.toISOString();
  const thirtyDaysAgoDate = thirtyDaysAgo.toISOString();
  const previousThirtyDaysDate = previousThirtyDays.toISOString();

  try {
    // Get current period metrics
    const { data: currentRevenue } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .gte('created_at', thirtyDaysAgoDate)
      .lte('created_at', currentDate);

    const { data: currentUsers } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', thirtyDaysAgoDate)
      .lte('created_at', currentDate);

    const { data: currentActiveUsers } = await supabase
      .from('user_sessions')
      .select('user_id')
      .gte('created_at', thirtyDaysAgoDate)
      .lte('created_at', currentDate);

    // Get previous period metrics for comparison
    const { data: previousRevenue } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .gte('created_at', previousThirtyDaysDate)
      .lt('created_at', thirtyDaysAgoDate);

    const { data: previousUsers } = await supabase
      .from('users')
      .select('id, created_at')
      .gte('created_at', previousThirtyDaysDate)
      .lt('created_at', thirtyDaysAgoDate);

    const { data: previousActiveUsers } = await supabase
      .from('user_sessions')
      .select('user_id')
      .gte('created_at', previousThirtyDaysDate)
      .lt('created_at', thirtyDaysAgoDate);

    // Calculate totals
    const currentUsersCount = currentUsers?.length || 0;
    const previousUsersCount = previousUsers?.length || 0;
    const currentActiveUsersCount = currentActiveUsers?.length || 0;
    const previousActiveUsersCount = previousActiveUsers?.length || 0;
    
    const currentRevenueTotal = currentRevenue?.reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) || 0;
    const previousRevenueTotal = previousRevenue?.reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) || 0;

    // Generate chart data for the last 30 days
    const chartData: ChartData[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      const dailyRevenue = data?.reduce((sum: number, t: Transaction) => sum + (t.amount || 0), 0) || 0;
      
      const { data: dailyUsers } = await supabase
        .from('users')
        .select('id')
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      chartData.unshift({
        date,
        revenue: dailyRevenue,
        users: dailyUsers?.length || 0
      });
    }

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate percentage changes
    const revenueChange = ((currentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100;
    const userChange = ((currentUsersCount - previousUsersCount) / previousUsersCount) * 100;
    const activeUserChange = ((currentActiveUsersCount - previousActiveUsersCount) / previousActiveUsersCount) * 100;

    // Format activity data
    const formattedActivity = recentActivity?.map((activity: Activity) => ({
      type: activity.type,
      timestamp: new Date(activity.created_at).toLocaleString()
    }));

    return {
      currentPeriod: {
        revenue: currentRevenueTotal,
        users: currentUsersCount,
        activeUsers: currentActiveUsersCount
      },
      previousPeriod: {
        revenue: previousRevenueTotal,
        users: previousUsersCount,
        activeUsers: previousActiveUsersCount
      },
      changes: {
        revenue: revenueChange,
        users: userChange,
        activeUsers: activeUserChange
      },
      chartData,
      recentActivity: formattedActivity || []
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw error;
  }
} 