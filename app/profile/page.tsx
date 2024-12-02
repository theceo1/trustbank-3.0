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
  Share,
  Share2
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
import { generateReferralCode } from "@/utils/referral";
import { ProfileService } from "../lib/services/profile";
import { Badge } from "@/components/ui/badge";

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
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        const profile = await ProfileService.getProfile(user.id);
        
        if (profile) {
          setUserData(user as ExtendedUser);
          setReferralCount(profile.referral_count || 0);
          setUserData(prev => ({
            ...prev!,
            user_metadata: {
              ...prev!.user_metadata,
              name: profile.full_name,
              referral_code: profile.referral_code,
              is_verified: profile.is_verified
            }
          }));
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
  }, [router, toast]);

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
    <div className="container mx-auto px-4 py-8 mt-16 space-y-6 max-w-7xl">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome, {userData?.user_metadata?.name || userData?.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-gray-500">
                Manage your account settings and preferences
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {userData?.user_metadata?.is_verified && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Verified Account
                </Badge>
              )}
            </div>
          </div>
          <ProfileHeader />
        </div>
      </div>
      
      {/* Profile Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Referral Code</p>
                <h3 className="text-2xl font-bold">{userData?.user_metadata?.referral_code || '...'}</h3>
              </div>
              <Button
                onClick={copyReferralCode}
                variant="outline"
                className="hover:bg-green-50"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Referrals</p>
                <h3 className="text-2xl font-bold">{referralCount}</h3>
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
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">KYC Status</p>
                <h3 className="text-2xl font-bold capitalize">{kycInfo?.status || 'Unverified'}</h3>
              </div>
              <Link href="/profile/verification">
                <Button className="bg-green-600 hover:bg-green-500">
                  <Shield className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {menuItems.map((item, index) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full bg-green-100 dark:bg-green-900/30 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      {/* Sign Out Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center mt-8"
      >
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
