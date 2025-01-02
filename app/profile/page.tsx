// app/profile/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card } from '@/components/ui/card';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { ApiKeys } from '@/components/profile/ApiKeys';
import { ReferralProgram } from '@/components/profile/ReferralProgram';
import { VerificationStatus } from '@/components/profile/VerificationStatus';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading } = useUserProfile();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/profile');
    }
  }, [user, router]);

  if (!user || !profile) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 space-y-6">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <UserProfileCard user={{
            name: profile.full_name,
            email: profile.email,
            avatar_url: profile.avatar_url ?? undefined,
            phone: profile.phone ?? undefined,
            country: profile.country ?? undefined
          }} />
          <SecuritySettings twoFactorEnabled={profile.two_factor_enabled} />
          <ApiKeys apiKeys={profile.api_keys} />
        </div>
        <div className="space-y-6">
          <VerificationStatus verificationStatus={{
            tier1_verified: profile.kyc_level >= 1,
            tier2_verified: profile.kyc_level >= 2,
            tier3_verified: profile.kyc_level >= 3
          }} />
          <NotificationSettings settings={profile.notification_settings} />
          <ReferralProgram 
            referralCode={profile.referral_code}
            referralStats={profile.referral_stats}
          />
        </div>
      </div>
    </div>
  );
}
