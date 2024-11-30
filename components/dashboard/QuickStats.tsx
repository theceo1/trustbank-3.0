"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Wallet, Users, LineChart } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import supabase from "@/lib/supabase/client";
import { StatsLoadingSkeleton } from "@/app/components/skeletons";

interface StatsData {
  totalBalance: number;
  activeTrades: number;
  totalTrades: number;
  monthlyChange: number;
}

export default function QuickStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        // First try to get existing stats
        const { data, error } = await supabase
          .from('stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No stats exist, create them
            const { data: newStats, error: createError } = await supabase
              .from('stats')
              .insert([
                { 
                  user_id: user.id,
                  total_transactions: 0,
                  total_volume: 0
                }
              ])
              .select()
              .single();

            if (createError) throw createError;
            setStats(newStats);
          } else {
            throw error;
          }
        } else {
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Set up real-time subscriptions
    const walletSubscription = supabase
      .channel('wallet-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${user.id}` },
        fetchStats
      )
      .subscribe();

    const tradesSubscription = supabase
      .channel('trades-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trades', filter: `user_id=eq.${user.id}` },
        fetchStats
      )
      .subscribe();

    return () => {
      walletSubscription.unsubscribe();
      tradesSubscription.unsubscribe();
    };
  }, [user]);

  if (isLoading) {
    return <StatsLoadingSkeleton />;
  }

  const statItems = [
    {
      title: "Total Balance",
      value: `$${stats?.totalBalance.toLocaleString() || '0'}`,
      change: `${stats?.monthlyChange.toFixed(1)}%`,
      isPositive: (stats?.monthlyChange || 0) >= 0,
      icon: <Wallet className="h-4 w-4" />
    },
    {
      title: "Active Trades",
      value: stats?.activeTrades.toString() || "0",
      change: "Real-time",
      isPositive: true,
      icon: <LineChart className="h-4 w-4" />
    },
    {
      title: "Monthly Trades",
      value: stats?.totalTrades.toString() || "0",
      change: "This Month",
      isPositive: true,
      icon: <Users className="h-4 w-4" />
    }
  ];

  // Rest of the rendering code remains the same
} 