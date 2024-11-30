"use client";

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import VerificationBadge from './VerificationBadge';
import supabase from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Copy, Share2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { validateReferralCode } from '@/utils/referral';
import { Badge } from "@/components/ui/badge";
import { ProfileService } from '@/app/lib/services/profile';

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  is_verified: boolean;
  referral_code: string | null;
  referred_by: string | null;
  referral_count: number;
  created_at: string;
}

export default function ProfileHeader() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        const profile = await ProfileService.getProfile(user.id);
        setProfile(profile);
        
        // Fetch referral count if needed
        if (profile.referral_code) {
          const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact' })
            .eq('referred_by', profile.referral_code);
            
          setReferralCount(count || 0);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          id: "profile-load-error",
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return;
    
    try {
      await navigator.clipboard.writeText(profile.referral_code);
      toast({
        id: "referral-code-copied",
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    } catch (err) {
      toast({
        id: "referral-code-copy-error",
        title: "Error",
        description: "Failed to copy referral code",
        variant: "destructive",
      });
    }
  };

  const shareReferralCode = async () => {
    if (!profile?.referral_code) return;
    
    try {
      await navigator.share({
        title: 'Join TrustBank',
        text: `Use my referral code: ${profile.referral_code}`,
        url: `${window.location.origin}/signup?ref=${profile.referral_code}`,
      });
    } catch (err) {
      // Fall back to copying to clipboard if share is not supported
      copyReferralCode();
    }
  };

  if (isLoading) {
    return <ProfileHeaderSkeleton />;
  }

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <User className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profile?.full_name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {profile?.email}
                </span>
                <VerificationBadge isVerified={profile?.is_verified || false} />
              </div>
            </div>
          </div>
        </div>

        {profile?.referral_code && (
          <div className="w-full md:w-auto space-y-2">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Referral Code
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyReferralCode}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shareReferralCode}
                      className="hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <code className="font-mono text-lg font-semibold text-green-600 dark:text-green-400">
                  {profile.referral_code}
                </code>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Earn up to 40% commission on referral trades
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Total Referrals: </span>
                    <span className="font-semibold">{profile?.referral_count || 0}</span>
                  </div>
                  {profile?.referred_by && (
                    <div className="text-sm">
                      <span className="text-gray-500">Referred By: </span>
                      <span className="font-mono">{profile.referred_by}</span>
                    </div>
                  )}
                </div>
                {profile?.referral_count >= 50 && (
                  <div className="mt-2">
                    <Badge variant="default" className="text-xs">
                      🎉 Elite Referrer
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
        </div>
        <Skeleton className="h-24 w-full md:w-72" />
      </div>
    </Card>
  );
}
