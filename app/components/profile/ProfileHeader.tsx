// app/components/profile/ProfileHeader.tsx
"use client";

import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import VerificationBadge from './VerificationBadge';
import { Button } from "@/components/ui/button";
import { Copy, Share2, User, Shield, Wallet, Bell, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { validateReferralCode } from '@/utils/referral';
import { Badge } from "@/components/ui/badge";
import { ProfileService } from '@/app/lib/services/profile';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_verified: boolean;
  kyc_level: number;
  kyc_status: string;
  referral_code: string | null;
  referred_by: string | null;
  referral_stats: {
    totalReferrals: number;
    activeReferrals: number;
    totalEarnings: number;
    pendingEarnings: number;
  };
  avatar_url: string | null;
  created_at: string;
}

export default function ProfileHeader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();
        setProfile(data.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return null;
  }

  const getKycProgress = () => {
    switch (profile.kyc_level) {
      case 0: return 33;
      case 1: return 66;
      case 2: return 100;
      default: return 0;
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary text-2xl">
            {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {profile.full_name || 'User'}
                {profile.is_verified && (
                  <VerificationBadge className="w-5 h-5 text-blue-500" />
                )}
              </h1>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>

            <div className="flex flex-wrap gap-2 md:ml-auto">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                KYC Level {profile.kyc_level}
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Wallet className="w-4 h-4" />
                Manage Wallet
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">KYC Progress</span>
              <span className="text-sm text-muted-foreground">{getKycProgress()}%</span>
            </div>
            <Progress value={getKycProgress()} className="h-2" />
          </div>

          {profile.referral_code && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Referral Program</h3>
                <Badge variant="secondary" className="font-mono">
                  {profile.referral_code}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="text-lg font-bold">{profile.referral_stats.totalReferrals}</div>
                  <div className="text-xs text-muted-foreground">Total Referrals</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="text-lg font-bold">{profile.referral_stats.activeReferrals}</div>
                  <div className="text-xs text-muted-foreground">Active Referrals</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="text-lg font-bold">₦{profile.referral_stats.totalEarnings.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Earnings</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                  <div className="text-lg font-bold">₦{profile.referral_stats.pendingEarnings.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Pending Earnings</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyReferralCode} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Code
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </Card>
  );
}
