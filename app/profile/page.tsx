// app/profile/page.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, AlertCircle, Shield, User, Mail, Phone, Link as LinkIcon, Calendar, Globe, Clock, Key, Edit } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from 'date-fns';
import { ReferralProgram } from "@/components/profile/ReferralProgram";
import TransactionHistory from "@/components/payment/TransactionHistory";

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
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  });
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const { data } = await response.json();
        
        // Get the last sign in time from the user object
        const lastSignIn = user.last_sign_in_at || new Date().toISOString();
        
        setProfile({
          ...data,
          last_sign_in_at: lastSignIn
        });
        setEditedProfile(data);

        // Fetch referral stats if we have a referral code
        if (data.referral_code) {
          const statsResponse = await fetch(`/api/referrals/stats?code=${data.referral_code}`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setReferralStats(statsData);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleEditProfile = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: editedProfile.full_name,
          phone: editedProfile.phone,
          country: editedProfile.country,
        }),
      });

      const { data, error } = await response.json();

      if (!response.ok || error) {
        throw new Error(error || 'Failed to update profile');
      }

      setProfile(data);
      setEditMode(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      setReferralCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setReferralCopied(false), 2000);
    }
  };

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Security</TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Referrals</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-2xl font-bold">Profile Information</CardTitle>
              {!editMode ? (
                <Button
                  variant="ghost"
                  onClick={() => setEditMode(true)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditMode(false);
                      setEditedProfile(profile || {});
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleEditProfile}
                    className="text-green-600 hover:text-green-700"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  {editMode ? (
                    <Input
                      value={editedProfile.full_name || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                    />
                  ) : (
                    <div className="text-lg font-medium">{profile?.full_name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="text-lg font-medium">{profile?.email}</div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  {editMode ? (
                    <Input
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    />
                  ) : (
                    <div className="text-lg font-medium">{profile?.phone || 'Not set'}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  {editMode ? (
                    <Input
                      value={editedProfile.country || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, country: e.target.value })}
                    />
                  ) : (
                    <div className="text-lg font-medium">{profile?.country || 'Not set'}</div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Account Status</h3>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(profile?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className={profile?.is_verified ? "text-green-500" : "text-yellow-500"} />
                    <span className={`font-medium ${profile?.is_verified ? "text-green-500" : "text-yellow-500"}`}>
                      {profile?.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Clock className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <div className="font-medium">Last Sign In</div>
                        <div className="text-sm text-gray-500">
                          {profile?.last_sign_in_at
                            ? formatDistance(new Date(profile.last_sign_in_at), new Date(), { addSuffix: true })
                            : 'Never'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Shield className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <div className="font-medium">KYC Level</div>
                        <div className="text-sm text-gray-500">
                          Level {profile?.kyc_level || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Globe className="h-8 w-8 mx-auto text-green-600 mb-2" />
                        <div className="font-medium">Trading Limits</div>
                        <div className="text-sm text-gray-500">
                          Daily: ₦{profile?.daily_limit?.toLocaleString() || '0'}
                          <br />
                          Monthly: ₦{profile?.monthly_limit?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/profile/security" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="mr-2 h-4 w-4" />
                  Security Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 rounded-t-lg">
              <CardTitle className="text-2xl">
                <span className="text-green-600">Earn</span> While You Share
              </CardTitle>
              <CardDescription className="text-base">
                Share your referral code with friends and earn up to 20% commission on their trading fees. The more they trade, the more you earn!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile?.referral_code ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-mono text-lg font-semibold">{profile.referral_code}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyReferralCode}
                      className={referralCopied ? "text-green-600" : "text-green-600"}
                    >
                      {referralCopied ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {referralCopied ? "Copied!" : "Copy Code"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
                          <div className="text-sm text-gray-500">Total Referrals</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{referralStats.activeReferrals}</div>
                          <div className="text-sm text-gray-500">Active Referrals</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">₦{referralStats.totalEarnings.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Total Earnings</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">₦{referralStats.pendingEarnings.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">Pending Earnings</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No referral code found. Please contact support to get your referral code.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View your recent transactions and trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionHistory limit={10} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
