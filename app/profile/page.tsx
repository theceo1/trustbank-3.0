// app/profile/page.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, AlertCircle, Shield, User, Mail, Phone, Link as LinkIcon, Calendar, Globe, Clock, Key } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from 'date-fns';
import { ReferralProgram } from "@/components/profile/ReferralProgram";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Announcements from "@/app/components/dashboard/Announcements";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  country?: string;
  referral_code?: string;
  kyc_level: number;
  kyc_status: string;
  is_verified: boolean;
  created_at: string;
  auth_created_at?: string;
  last_sign_in_at?: string;
  daily_limit?: number;
  monthly_limit?: number;
  quidax_id?: string;
  tier1_verified: boolean;
  tier2_verified: boolean;
  tier3_verified: boolean;
  two_factor_enabled?: boolean;
  verification_limits?: {
    tier1: {
      daily: number;
      monthly: number;
    };
    tier2: {
      daily: number;
      monthly: number;
    };
    tier3: {
      daily: number;
      monthly: number;
    };
  };
  wallet?: {
    currency: string;
    balance: string;
    locked: string;
    staked: string;
    converted_balance: string;
    reference_currency: string;
  }[];
  recent_transactions?: {
    id: string;
    type: string;
    amount: string;
    currency: string;
    status: string;
    created_at: string;
  }[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSignIn, setLastSignIn] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);

      // Only fetch referral stats if user has a referral code
      if (data.referral_code) {
        try {
          const statsResponse = await fetch(`/api/referrals/stats?code=${data.referral_code}`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setReferralStats(statsData);
          }
        } catch (error) {
          console.error('Error fetching referral stats:', error);
        }
      }

      // Set last sign in time
      if (user?.user_metadata?.last_sign_in_at) {
        setLastSignIn(user.user_metadata.last_sign_in_at);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Add wallet setup function
  async function setupWallet() {
    setLoading(true);
    try {
      const response = await fetch('/api/create-quidax-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to setup wallet');
      }
      
      // Refresh the page to show updated wallet status
      router.refresh();
    } catch (err: unknown) {
      console.error('Error setting up wallet:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to setup wallet',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isVerified = profile?.kyc_status === 'verified';
  const kycLevel = profile?.kyc_level ?? 0;
  const hasWallet = profile?.quidax_id && Array.isArray(profile?.wallet) && profile.wallet.length > 0;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-green-600/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Profile Header Card */}
            <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-2xl font-bold dark:text-gray-100">{profile?.full_name}</h2>
                      <p className="text-muted-foreground">{profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={() => router.push('/profile/settings')}>
                      <Shield className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Cards Grid */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              {/* KYC Status Card */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/50 dark:to-orange-900/50 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Shield className={cn(
                      "h-8 w-8 mx-auto mb-2",
                      isVerified ? "text-green-600 dark:text-green-500" : "text-yellow-600 dark:text-yellow-500"
                    )} />
                    <div className="font-medium dark:text-gray-100">KYC Status</div>
                    <div className={cn(
                      "text-sm",
                      isVerified ? "text-green-600 dark:text-green-500" : "text-yellow-600 dark:text-yellow-500"
                    )}>
                      {isVerified ? 'Verified' : 'Pending Verification'}
                    </div>
                    {!isVerified && (
                      <Link 
                        href="/profile/verification" 
                        className="mt-2 text-xs text-primary hover:underline inline-flex items-center dark:text-green-500"
                      >
                        Complete Verification →
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* KYC Level Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/50 dark:to-indigo-900/50 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Key className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-500" />
                    <div className="font-medium dark:text-gray-100">KYC Level</div>
                    <div className="text-sm text-blue-600 dark:text-blue-500">
                      {kycLevel === 0 ? 'Basic' : `Level ${kycLevel}`}
                    </div>
                    <Link 
                      href="/profile/verification" 
                      className="mt-2 text-xs text-primary hover:underline inline-flex items-center dark:text-green-500"
                    >
                      Upgrade Level →
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Trading Limits Card */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/50 dark:to-teal-900/50 border-emerald-200 dark:border-emerald-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Globe className="h-8 w-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-500" />
                    <div className="font-medium dark:text-gray-100">Trading Limits</div>
                    <div className="text-sm space-y-1">
                      <p className="text-emerald-600 dark:text-emerald-500">Daily: ₦{profile?.daily_limit?.toLocaleString() || '100,000'}</p>
                      <p className="text-emerald-600 dark:text-emerald-500">Monthly: ₦{profile?.monthly_limit?.toLocaleString() || '2,000,000'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Announcements Section */}
            <div className="mb-6">
              <Announcements isVerified={isVerified} />
            </div>

            {/* Account Info Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    <span className="text-sm font-medium dark:text-gray-200">Email:</span>
                    <span className="text-sm text-muted-foreground">{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    <span className="text-sm font-medium dark:text-gray-200">Phone:</span>
                    <span className="text-sm text-muted-foreground">{profile?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    <span className="text-sm font-medium dark:text-gray-200">Country:</span>
                    <span className="text-sm text-muted-foreground">{profile?.country || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    <span className="text-sm font-medium dark:text-gray-200">Joined:</span>
                    <span className="text-sm text-muted-foreground">
                      {profile?.created_at ? formatDistance(new Date(profile.created_at), new Date(), { addSuffix: true }) : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-500" />
                    <span className="text-sm font-medium dark:text-gray-200">Last Sign In:</span>
                    <span className="text-sm text-muted-foreground">
                      {lastSignIn ? formatDistance(new Date(lastSignIn), new Date(), { addSuffix: true }) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Password</h3>
                      <p className="text-sm text-muted-foreground">Update your password regularly to keep your account secure</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/auth/reset-password')}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>

                {/* 2FA Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Two-Factor Authentication (2FA)</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/profile/2fa-setup')}
                    >
                      {profile?.two_factor_enabled ? 'Manage 2FA' : 'Enable 2FA'}
                    </Button>
                  </div>
                </div>

                {/* Login History Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Login History</h3>
                      <p className="text-sm text-muted-foreground">Review your recent login activities</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/profile/login-history')}
                    >
                      View History
                    </Button>
                  </div>
                </div>

                {/* API Keys Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">API Keys</h3>
                      <p className="text-sm text-muted-foreground">Manage your API keys for automated trading</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/profile/api-keys')}
                    >
                      Manage Keys
                    </Button>
                  </div>
                </div>

                {/* Session Management */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Active Sessions</h3>
                      <p className="text-sm text-muted-foreground">Manage your active sessions across devices</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "Session management will be available soon."
                        });
                      }}
                    >
                      View Sessions
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            {/* Referral Header */}
            <Card className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/50 dark:to-emerald-900/50 border-green-200 dark:border-green-800">
              <CardContent className="py-8 text-center">
                <h2 className="text-3xl font-bold mb-2">
                  <span className="text-green-600 dark:text-green-500">Earn</span> While You Share
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Invite friends to TrustBank and earn up to 20% commission on their trading fees. 
                  The more they trade, the more you earn!
                </p>
              </CardContent>
            </Card>

            <ReferralProgram 
              referralCode={profile?.referral_code === undefined ? null : profile.referral_code}
              referralStats={referralStats}
              onGenerateCode={async () => {
                toast({
                  title: "Coming Soon",
                  description: "Referral code generation will be available soon."
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
