// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TransactionLimits } from '@/app/components/dashboard/TransactionLimits';
import { QuickActions } from '@/app/components/dashboard/QuickActions';
import { AccountBalance } from '@/app/components/dashboard/AccountBalance';
import { RecentTransactionsList } from '@/app/components/dashboard/RecentTransactionsList';
import { WalletOverview } from '@/app/components/dashboard/WalletOverview';
import { useAuth } from '@/app/context/AuthContext';
import DashboardHeader from '@/app/components/dashboard/DashboardHeader';
import Announcements from '@/app/components/dashboard/Announcements';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Wait for auth state to be checked
        if (loading) return;

        // If no session, redirect to login
        if (!session || !user) {
          console.log('No session found, redirecting to login');
          router.replace('/auth/login?redirect=/dashboard');
          return;
        }

        // Check user profile - only query existing columns
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('kyc_status, kyc_level, is_verified')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          toast.error('Failed to load user profile');
          return;
        }

        setProfile(profileData);

        // Check if user is verified
        if (!profileData.is_verified) {
          toast.error('Please complete your KYC verification');
          router.replace('/kyc');
          return;
        }

        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        toast.error('Failed to initialize dashboard');
        setIsLoading(false);
      }
    };

    initializeSession();
  }, [user, session, loading, router, supabase]);

  // Show loading state while checking auth
  if (loading || !isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 text-green-600" />
        </motion.div>
      </div>
    );
  }

  // Show loading state while loading dashboard data
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-green-600" />
          </motion.div>
        </div>
      </div>
    );
  }

  // If no session, return null (will be redirected by useEffect)
  if (!session || !user) {
    return null;
  }

  return (
    <div className="container relative mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid gap-8"
      >
        {/* Dashboard Header with Welcome Message */}
        <DashboardHeader 
          displayName={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'} 
          isVerified={profile?.is_verified || false}
        />

        {/* Account Balance and Transaction Limits */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AccountBalance />
          </motion.div>
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TransactionLimits />
          </motion.div>
        </div>

        {/* Announcements/Ads Section */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Announcements isVerified={profile?.is_verified || false} />
        </motion.div>

        {/* Quick Actions and Recent Transactions */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <QuickActions className="h-full" />
          </motion.div>
          <motion.div
            initial={{ x: 20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <RecentTransactionsList />
          </motion.div>
        </div>

        {/* Wallet Overview */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <WalletOverview />
        </motion.div>
      </motion.div>
    </div>
  );
}

