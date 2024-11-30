"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  LogOut, 
  Shield, 
  History, 
  User as UserIcon, 
  Settings,
  Bell,
  Key,
  Wallet,
  Copy,
  Share
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProfileHeader from '@/app/components/profile/ProfileHeader';
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase/client";
import { User } from '@supabase/supabase-js';
import { Skeleton } from "@/components/ui/skeleton";
import ProfileSkeleton from "../components/profile/ProfileSkeleton";
import { KYCTierInfo } from "../components/profile/KYCTierInfo";
import { KYCService } from "../lib/services/kyc";
import { useQuery } from "@tanstack/react-query";
import { KYCInfo } from "@/app/types/kyc";

export const dynamic = 'force-dynamic';

interface ExtendedUser extends Omit<User, 'created_at'> {
  user_metadata: {
    name?: string;
    is_verified?: boolean;
    email?: string;
    referral_code?: string;
  };
  email?: string;
  created_at?: string;
}

const menuItems = [
  {
    href: "/profile/personal-info",
    icon: <UserIcon className="w-6 h-6" />,
    title: "Personal Info",
    description: "Update your personal information",
    color: "text-blue-600"
  },
  {
    href: "/profile/security",
    icon: <Key className="w-6 h-6" />,
    title: "Security",
    description: "Manage your security settings",
    color: "text-red-600"
  },
  {
    href: "/profile/wallet",
    icon: <Wallet className="w-6 h-6" />,
    title: "Wallet",
    description: "Manage your wallet and transactions",
    color: "text-green-600"
  },
  {
    href: "/profile/notifications",
    icon: <Bell className="w-6 h-6" />,
    title: "Notifications",
    description: "Configure your notification preferences",
    color: "text-yellow-600"
  },
  {
    href: "/profile/verification",
    icon: <Shield className="w-6 h-6" />,
    title: "Verification",
    description: "Complete your KYC verification",
    color: "text-purple-600"
  },
  {
    href: "/profile/transaction-history",
    icon: <History className="w-6 h-6" />,
    title: "Transaction History",
    description: "View your complete transaction history",
    color: "text-indigo-600"
  }
];

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserData(user as ExtendedUser);
          
          // Fetch only existing columns
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('referral_code, referral_count')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            return;
          }
          
          if (profileData) {
            setReferralCount(profileData.referral_count || 0);
            setUserData(prev => ({
              ...prev!,
              user_metadata: {
                ...prev!.user_metadata,
                referral_code: profileData.referral_code
              }
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          id: 'profile-error',
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
      toast({
        id: 'signout-success',
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        id: 'signout-error',
        title: "Sign out failed",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: kycInfo, isLoading: kycLoading } = useQuery({
    queryKey: ['kycInfo', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user ID');
      return KYCService.getKYCInfo(user.id);
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  function copyReferralCode(event: React.MouseEvent<HTMLButtonElement>): void {
    const referralCode = userData?.user_metadata?.referral_code;
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        id: 'copy-success',
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20 space-y-8">
        {/* Profile Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{userData?.user_metadata?.name || 'User'}</h1>
                    <p className="text-muted-foreground">{userData?.email}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <Link href="/profile/verification">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Account
                    </Button>
                  </Link>
                  <Link href="/profile/account-settings">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="w-full bg-card">
            <CardHeader>
              <CardTitle className="text-xl">Referral Program</CardTitle>
              <CardDescription>Share trustBank with friends and family</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Your Referral Code:</p>
                    <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                      {userData?.user_metadata?.referral_code || 'Loading...'}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={copyReferralCode}
                      className="h-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Referrals: {referralCount}
                  </p>
                </div>
                <Button 
                  onClick={() => {
                    if (userData?.user_metadata?.referral_code) {
                      navigator.share({
                        title: 'Join trustBank',
                        text: `Use my referral code: ${userData.user_metadata.referral_code}`,
                        url: window.location.origin
                      }).catch(console.error);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-500"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Referral Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* KYC Status Banner */}
        {kycInfo && !kycLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <KYCTierInfo
              currentTier={kycInfo.currentTier}
              verificationStatus={kycInfo.status}
              completedRequirements={[]}
            />
          </motion.div>
        )}

        {/* Menu Grid */}
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${item.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}>
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Sign Out Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-12"
        >
          <Button 
            onClick={handleSignOut} 
            variant="destructive" 
            size="lg"
            className="px-8 hover:scale-105 transition-transform duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
