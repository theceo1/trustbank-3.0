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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
        <p className="text-gray-600">Complete verification to unlock platform features</p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.key}
            {...fadeInUp}
            animate="animate"
            transition={{ 
              duration: 0.5,
              delay: index * 0.2 
            }}
          >
            <Card className="h-full relative overflow-hidden">
              {kycInfo?.currentTier === tier.key && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="text-green-500 h-6 w-6" />
                </div>
              )}
              
              <CardHeader>
                <Shield className="h-8 w-8 mb-2 text-green-600" />
                <h3 className="text-xl font-semibold">{tier.name}</h3>
              </CardHeader>

              <CardContent className="space-y-4">
                <Progress 
                  value={kycInfo?.currentTier === tier.key ? 100 : 0} 
                  className="h-2"
                />
                <p className="text-sm text-gray-600">{tier.description}</p>
                <div className="space-y-2">
                  <h4 className="font-medium">Requirements:</h4>
                  <ul className="text-sm space-y-1">
                    {tier.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

                  <CardFooter>
                <Button
                  onClick={() => handleStartVerification(tier)}
                  className="w-full bg-green-600 hover:bg-green-300 text-white hover:text-black transition-all duration-300"
                >
                  {kycInfo?.currentTier === tier.key ? 'Verified' : 'Start Verification'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}