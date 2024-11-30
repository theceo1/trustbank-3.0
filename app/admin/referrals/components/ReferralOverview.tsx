"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, TrendingUp, Award, DollarSign, 
  ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import supabase from "@/lib/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ReferralStats {
  totalReferrals: number;
  activeReferrers: number;
  totalEarnings: number;
  topTier: string;
  monthlyGrowth: number;
  dailyReferrals: { date: string; count: number }[];
}

export default function ReferralOverview() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total referrals
        const { data: totalData } = await supabase
          .from('profiles')
          .select('referral_count')
          .not('referral_count', 'eq', 0);

        // Fetch active referrers (users with at least one referral)
        const { data: activeData } = await supabase
          .from('profiles')
          .select('count')
          .gt('referral_count', 0);

        // Fetch total earnings
        const { data: earningsData } = await supabase
          .from('referral_transactions')
          .select('amount')
          .eq('status', 'COMPLETED');

        // Fetch daily referrals for the past 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: dailyData } = await supabase
          .from('profiles')
          .select('created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .not('referred_by', 'is', null);

        // Process the data
        const totalReferrals = totalData?.reduce((sum, item) => sum + item.referral_count, 0) || 0;
        const activeReferrers = activeData?.[0]?.count || 0;
        const totalEarnings = earningsData?.reduce((sum, item) => sum + item.amount, 0) || 0;

        // Process daily referrals
        const dailyReferrals = processDailyReferrals(dailyData || []);

        setStats({
          totalReferrals,
          activeReferrers,
          totalEarnings,
          topTier: 'ELITE',
          monthlyGrowth: calculateGrowth(dailyReferrals),
          dailyReferrals
        });
      } catch (error) {
        console.error('Error fetching referral stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <ReferralOverviewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Referrals"
          value={stats?.totalReferrals || 0}
          icon={<Users className="h-6 w-6" />}
          trend={stats?.monthlyGrowth || 0}
        />
        <StatsCard
          title="Active Referrers"
          value={stats?.activeReferrers || 0}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatsCard
          title="Total Earnings"
          value={`₦${(stats?.totalEarnings || 0).toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatsCard
          title="Top Tier"
          value={stats?.topTier || 'BRONZE'}
          icon={<Award className="h-6 w-6" />}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.dailyReferrals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  icon, 
  trend 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode;
  trend?: number;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {trend !== undefined && (
              <div className="flex items-center mt-2">
                {trend >= 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-100 rounded-full dark:bg-gray-800">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}

function processDailyReferrals(data: any[]) {
  const dailyCounts: { [key: string]: number } = {};
  const today = new Date();
  
  // Initialize last 30 days with 0
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyCounts[dateStr] = 0;
  }

  // Count referrals per day
  data.forEach(item => {
    const date = new Date(item.created_at).toISOString().split('T')[0];
    if (dailyCounts[date] !== undefined) {
      dailyCounts[date]++;
    }
  });

  // Convert to array format for chart
  return Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .reverse();
}

function calculateGrowth(dailyData: { date: string; count: number }[]) {
  const currentMonth = dailyData.slice(0, 30).reduce((sum, item) => sum + item.count, 0);
  const previousMonth = dailyData.slice(30, 60).reduce((sum, item) => sum + item.count, 0);
  
  if (previousMonth === 0) return 100;
  return Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
}