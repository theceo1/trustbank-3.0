"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  RefreshCcw,
  Activity
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useAdminAuth } from "./context/AdminAuthContext";
import supabase from "@/lib/supabase/client";
import { StatsCard } from "./components/StatsCard";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalReferrals: number;
  totalEarnings: number;
  userGrowth: number;
  earningsGrowth: number;
  recentActivity: any[];
  chartData: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { hasPermission } = useAdminAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch various statistics from Supabase
      const { data: usersData } = await supabase
        .from('profiles')
        .select('count');

      const { data: referralsData } = await supabase
        .from('profiles')
        .select('referral_count');

      // ... fetch other statistics

      setStats({
        totalUsers: usersData?.[0]?.count || 0,
        activeUsers: 0, // Calculate from user activity
        totalReferrals: referralsData?.reduce((sum, item) => sum + item.referral_count, 0) || 0,
        totalEarnings: 0, // Calculate from transactions
        userGrowth: 0,
        earningsGrowth: 0,
        recentActivity: [],
        chartData: []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={10}
        />
        <StatsCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={Activity}
          trend={-5}
        />
        <StatsCard
          title="Total Referrals"
          value={stats?.totalReferrals || 0}
          icon={RefreshCcw}
          trend={15}
        />
        <StatsCard
          title="Total Earnings"
          value={`₦${(stats?.totalEarnings || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={8}
        />
      </div>

      {/* Add charts and recent activity here */}
    </div>
  );
}