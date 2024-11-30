// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "../context/AdminAuthContext";
import supabase from "@/lib/supabase/client";
import { Users, Share2, UserCheck, AlertTriangle, Activity, RefreshCcw, DollarSign } from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  totalReferrals: number;
  pendingVerifications: number;
  activeUsers: number;
  totalEarnings: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalReferrals: 0,
    pendingVerifications: 0,
    activeUsers: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const { data: users } = await supabase
          .from('profiles')
          .select('*');

        const { data: verifiedUsers } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_verified', true);

        // Calculate active users (users who logged in within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsers = users?.filter(user => 
          new Date(user.last_sign_in_at) > thirtyDaysAgo
        ).length || 0;

        setStats({
          totalUsers: users?.length || 0,
          verifiedUsers: verifiedUsers?.length || 0,
          totalReferrals: users?.reduce((acc, user) => acc + (user.referral_count || 0), 0) || 0,
          pendingVerifications: (users?.length || 0) - (verifiedUsers?.length || 0),
          activeUsers,
          totalEarnings: 0 // You'll need to implement this based on your transactions table
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}