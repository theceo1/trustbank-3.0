//app/profile/verification/page.tsx
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser } from '@/app/hooks/use-user';
import { Separator } from '@/components/ui/separator';
import { KYCTier, KYCTierInfo, KYC_LIMITS } from '@/app/types/kyc';

export default function VerificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { user: userData } = useUser();
  const [loading, setLoading] = useState(false);

  // Get KYC status from user profile
  const kycStatus = userData?.kyc_status || 'unverified';
  const kycLevel = userData?.kyc_level || 0;
  
  const tiers: KYCTierInfo[] = [
    {
      tier: KYCTier.BASIC,
      title: "Basic Verification",
      description: "Perfect for getting started with basic trading",
      requirements: ["Nigerian National Identity Number (NIN)", "Selfie verification"],
      limits: KYC_LIMITS[KYCTier.BASIC],
      route: "/profile/verification/nin",
      completed: kycLevel >= KYCTier.BASIC
    },
    {
      tier: KYCTier.INTERMEDIATE,
      title: "Intermediate Verification",
      description: "Link your BVN for increased limits",
      requirements: ["Bank Verification Number (BVN)", "Basic verification required"],
      limits: KYC_LIMITS[KYCTier.INTERMEDIATE],
      route: "/profile/verification/bvn",
      completed: kycLevel >= KYCTier.INTERMEDIATE
    },
    {
      tier: KYCTier.ADVANCED,
      title: "Advanced Verification",
      description: "Complete full KYC for highest limits",
      requirements: ["Government-issued Photo ID", "Selfie verification", "Intermediate verification required"],
      limits: KYC_LIMITS[KYCTier.ADVANCED],
      route: "/profile/verification/id",
      completed: kycLevel >= KYCTier.ADVANCED
    }
  ];

  const handleStartVerification = (tierInfo: KYCTierInfo) => {
    // Check if previous tier is completed
    if (tierInfo.tier > KYCTier.BASIC && kycLevel < tierInfo.tier - 1) {
      toast({
        title: "Complete Previous Tier",
        description: "Please complete the previous verification level first",
        variant: "destructive"
      });
      return;
    }

    // If already verified this tier
    if (tierInfo.completed) {
      toast({
        title: "Already Verified",
        description: "You have already completed this verification level",
        variant: "default"
      });
      return;
    }

    // Proceed with verification
    router.push(tierInfo.route);
  };

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <div className="container max-w-6xl mx-auto px-4 py-8 flex-grow">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-lg font-bold">Identity Verification</h1>
            <p className="text-gray-600">Verify your identity to unlock higher trading limits</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 place-items-center">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.tier}
              className="w-full max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full relative overflow-hidden border-2 hover:border-green-500 transition-all">
                {tier.completed && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="text-green-600 h-6 w-6" />
                  </div>
                )}
                
                <CardHeader>
                  <Shield className="h-8 w-8 mb-2 text-green-600" />
                  <CardTitle className="text-xl font-semibold">
                    {tier.title}
                  </CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Trading Limits:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">Daily Limit</p>
                        <p className="font-bold text-green-600">₦{tier.limits.dailyLimit.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600">Monthly Limit</p>
                        <p className="font-bold text-green-600">₦{tier.limits.monthlyLimit.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Requirements:</h4>
                    <ul className="text-sm space-y-1">
                      {tier.requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2">
                          {tier.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          )}
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => handleStartVerification(tier)}
                    className="w-full bg-green-600 hover:bg-green-300 text-black dark:text-black dark:hover:text-black"
                    disabled={loading || tier.completed}
                  >
                    {tier.completed ? (
                      'Verified'
                    ) : (
                      <span className="flex items-center gap-2">
                        Start Verification
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}