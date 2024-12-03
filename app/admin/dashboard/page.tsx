// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Activity,
  RefreshCcw,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { StatsCard } from "../components/StatsCard";
import { ActivityFeed } from "../components/ActivityFeed";
import { DashboardChart } from "../components/DashboardChart";
import { fetchDashboardStats } from "../lib/api";
import { DashboardSkeleton } from "../components/DashboardSkeleton";
import { DashboardStats } from "../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={stats?.userGrowth}
        />
        <StatsCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={Activity}
          trend={stats?.activeUserGrowth}
        />
        <StatsCard
          title="Total Referrals"
          value={stats?.totalReferrals || 0}
          icon={RefreshCcw}
          trend={stats?.referralGrowth}
        />
        <StatsCard
          title="Total Revenue"
          value={`₦${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={DollarSign}
          trend={stats?.revenueGrowth}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart data={stats?.chartData || []} />
          </CardContent>
        </Card>
        <ActivityFeed activities={stats?.recentActivity || []} />
      </div>
    </div>
  );
}