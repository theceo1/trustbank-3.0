// app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, AlertCircle, Shield, User, Mail, Phone, Link as LinkIcon, Calendar, Globe, Clock, Key } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from 'date-fns';

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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never';
    return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
          </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please sign in to view your profile.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 pt-20">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        {!profile.is_verified && (
          <Button asChild variant="outline">
            <Link href="/profile/verification">
              <Shield className="mr-2 h-4 w-4" />
              Verify Identity
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Profile Details</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Security</TabsTrigger>
          <TabsTrigger value="limits" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Limits & Verification</TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profile.full_name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profile.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profile.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{profile.country || 'Not specified'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(profile.auth_created_at || profile.created_at)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Sign In</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatTimeAgo(profile.last_sign_in_at)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Enable 2FA
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your password regularly to keep your account secure
                    </p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Status & Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className={`h-5 w-5 ${profile.is_verified ? 'text-green-500' : 'text-yellow-500'}`} />
                <span className="font-medium">
                  KYC Level {profile.kyc_level} - {profile.kyc_status.charAt(0).toUpperCase() + profile.kyc_status.slice(1)}
                </span>
              </div>

              {!profile.is_verified && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Complete your KYC verification to increase your trading limits.
                    <Button asChild variant="link" className="pl-2">
                      <Link href="/profile/verification">Verify Now</Link>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6">
                {[1, 2, 3].map((tier) => (
                  <div key={tier} className="space-y-3">
                    <h3 className="font-medium">Tier {tier} Limits</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Daily Limit</Label>
                        <div className="text-lg font-medium">
                          ₦{profile.verification_limits?.[`tier${tier}` as keyof typeof profile.verification_limits]?.daily.toLocaleString() || '0'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Limit</Label>
                        <div className="text-lg font-medium">
                          ₦{profile.verification_limits?.[`tier${tier}` as keyof typeof profile.verification_limits]?.monthly.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${profile[`tier${tier}_verified` as keyof typeof profile] ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className="text-sm text-muted-foreground">
                        {profile[`tier${tier}_verified` as keyof typeof profile] ? 'Verified' : 'Not Verified'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Your Referral Code</h3>
                  <div className="flex items-center space-x-2">
                    <Input
                      readOnly
                      value={profile.referral_code || 'Not available'}
                      className="font-mono"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={copyReferralCode}
                      disabled={!profile.referral_code}
                    >
                      {referralCopied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Share your referral code with friends and earn rewards when they sign up and trade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
