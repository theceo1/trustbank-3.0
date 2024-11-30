// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bell, Wallet, ArrowUpRight, Settings, Shield } from "lucide-react";
import AccountBalance from '@/components/dashboard/AccountBalance';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import MarketOverview from '@/components/dashboard/MarketOverview';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import LoadingDashboard from '@/app/components/dashboard/LoadingDashboard';
import QuickStats from '@/app/components/dashboard/QuickStats';
import QuickActions from '@/app/components/dashboard/QuickActions';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase/client";
import CryptoPriceTracker from "@/components/dashboard/CryptoPriceTracker";
import Announcements from '@/app/components/dashboard/Announcements';
import TransactionDetails from '@/app/components/transactions/TransactionDetails';
import { Transaction } from "@/app/types/transactions";
import { Trade } from "../components/dashboard/Trade";

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState('');

  // Add new loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.is_verified) {
        setIsVerified(true);
      }
    };
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();

        if (profile?.full_name) {
          setDisplayName(profile.full_name);
        } else if (user.user_metadata?.name) {
          setDisplayName(user.user_metadata.name);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'User');
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTransactions(data);
      }
    };

    fetchTransactions();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('transactions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Enhanced loading component
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <LoadingDashboard />
      </div>
    );
  }

  // Enhanced error handling
  if (loadingError) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        <Alert variant="destructive">
          <AlertDescription>{loadingError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
      <DashboardHeader displayName={displayName} isVerified={isVerified} />
      <Announcements isVerified={isVerified} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="lg:col-span-1 space-y-8"
        >
          <QuickStats />
          <AccountBalance />
          <CryptoPriceTracker />
          <QuickActions />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="lg:col-span-2 space-y-8"
        >
          <MarketOverview itemsPerPage={4} />
          <Trade />
          <RecentTransactions />
        </motion.div>
      </div>

      <TransactionDetails
        transaction={selectedTransaction}
        open={!!selectedTransaction}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
      />
    </div>
  );
}
