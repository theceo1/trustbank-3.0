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
import { Copy, CheckCircle, AlertCircle, Shield, User, Mail, Phone, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  referral_code?: string;
  kyc_level: number;
  kyc_status: string;
  is_verified: boolean;
  created_at: string;
  country?: string;
  daily_limit?: number;
  monthly_limit?: number;
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
        <Button asChild variant="outline">
          <Link href="/profile/verification">
            <Shield className="mr-2 h-4 w-4" />
            Verify Identity
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile Details</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="limits">Limits & Verification</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.full_name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <span>{profile.country || 'Not specified'}</span>
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
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your password regularly
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
              <CardTitle>Account Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Verification Level {profile.kyc_level}</h3>
                  <p className="text-sm text-muted-foreground">
                    Status: {profile.kyc_status}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Daily Limit</span>
                    <span>₦{profile.daily_limit?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Limit</span>
                    <span>₦{profile.monthly_limit?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                {!profile.is_verified && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Verify your identity to increase your limits.{' '}
                      <Link href="/profile/verification" className="font-medium hover:underline">
                        Verify Now
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Program</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Your Referral Code</h3>
                  <div className="flex items-center space-x-2 mt-2">
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
        </div>
                <div>
                  <h3 className="font-medium">Referral Link</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/register?ref=${profile.referral_code}`}
                      className="font-mono text-sm"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${profile.referral_code}`);
                        toast({
                          title: "Copied!",
                          description: "Referral link copied to clipboard",
                        });
                      }}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
        </div>
      </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
