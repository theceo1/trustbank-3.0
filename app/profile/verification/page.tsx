'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { KYCService } from '@/app/lib/services/kyc';
import { KYC_TIERS } from '@/app/lib/constants/kyc-tiers';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import { ArrowRight } from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerificationPage() {
  const router = useRouter();
  const { kycInfo, user } = useAuth();
  const { toast } = useToast();
  
  const tiers = [
    {
      key: "tier1",
      name: "Tier 1 - Basic",
      description: "Start with basic verification to access essential features",
      requirements: ["Valid NIN (National Identity Number)"],
      limits: KYC_TIERS.tier1,
      route: "/profile/verification/nin",
      requiredDocs: ["nin"]
    },
    {
      key: "tier2",
      name: "Tier 2 - Intermediate",
      description: "Unlock higher limits and more features",
      requirements: ["Valid BVN (Bank Verification Number)"],
      limits: KYC_TIERS.tier2,
      route: "/profile/verification/bvn",
      requiredDocs: ["bvn"]
    },
    {
      key: "tier3",
      name: "Tier 3 - Advanced",
      description: "Maximum limits and full platform access",
      requirements: ["International Passport", "or", "Driver's License"],
      limits: KYC_TIERS.tier3,
      route: "/profile/verification/id",
      requiredDocs: ["international_passport", "drivers_license"]
    }
  ];

  const handleStartVerification = (tier: typeof tiers[0]) => {
    // Check if user can proceed to this tier
    if (tier.key === 'tier2' && (!kycInfo || kycInfo.currentTier === 'unverified')) {
      toast({
        id: "tier1-required",
        title: "Complete Tier 1 First",
        description: "Please complete basic verification before proceeding to intermediate",
        variant: "destructive"
      });
      return;
    }

    if (tier.key === 'tier3' && (!kycInfo || kycInfo.currentTier !== 'tier2')) {
      toast({
        id: "tier2-required",
        title: "Complete Tier 2 First",
        description: "Please complete intermediate verification before proceeding to advanced",
        variant: "destructive"
      });
      return;
    }

    // If already verified this tier
    if (kycInfo?.currentTier === tier.key) {
      toast({
        id: "tier-already-verified",
        title: "Already Verified",
        description: "You have already completed this verification level",
        variant: "default"
      });
      return;
    }

    // Proceed with verification
    router.push(tier.route);
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-20">
      <BackButton />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-6">Account Verification</h1>
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card key={tier.key} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className={KYC_TIERS[tier.key as keyof typeof KYC_TIERS].color}>
                    {tier.name}
                  </span>
                  {kycInfo?.currentTier === tier.key && (
                    <span className="text-sm text-green-500">✓ Verified</span>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      {tier.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Transaction Limits:</h4>
                    <ul className="text-sm space-y-1">
                      <li>Daily: ₦{KYC_TIERS[tier.key as keyof typeof KYC_TIERS].dailyLimit.toLocaleString()}</li>
                      <li>Monthly: {
                        tier.key === 'tier3' 
                          ? 'Unlimited' 
                          : `₦${KYC_TIERS[tier.key as keyof typeof KYC_TIERS].monthlyLimit.toLocaleString()}`
                      }</li>
                    </ul>
                  </div>

                  <Button 
                    onClick={() => handleStartVerification(tier)}
                    className="w-full mt-4"
                    variant={kycInfo?.currentTier === tier.key ? "outline" : "default"}
                    disabled={
                      (tier.key === "tier2" && (!kycInfo || kycInfo.currentTier === "unverified")) ||
                      (tier.key === "tier3" && (!kycInfo || kycInfo.currentTier !== "tier2")) ||
                      kycInfo?.currentTier === tier.key
                    }
                  >
                    {kycInfo?.currentTier === tier.key ? (
                      "Already Verified"
                    ) : (
                      <>
                        Start Verification
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}