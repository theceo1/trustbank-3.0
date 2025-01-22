//app/profile/verification/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { KYCService } from '@/app/lib/services/kyc';
import { KYCStatus, KYCTier } from '@/app/types/kyc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KYCStatusState {
  isVerified: boolean;
  tier: KYCTier;
  status: KYCStatus;
}

const TIER_ROUTES: Record<KYCTier, string | undefined> = {
  [KYCTier.NONE]: '/verification/kyc/nin',
  [KYCTier.BASIC]: '/verification/kyc/bvn',
  [KYCTier.INTERMEDIATE]: '/verification/kyc/photo-id',
  [KYCTier.ADVANCED]: undefined,
};

const TIER_INFO = [
  {
    title: 'Basic Tier',
    description: 'Start with basic verification',
    requirements: ['NIN Verification'],
    limits: {
      daily: '₦50,000',
      monthly: '₦1,000,000'
    },
    tier: KYCTier.NONE
  },
  {
    title: 'Intermediate Tier',
    description: 'Unlock higher limits',
    requirements: ['BVN Verification'],
    limits: {
      daily: '₦200,000',
      monthly: '₦5,000,000'
    },
    tier: KYCTier.BASIC
  },
  {
    title: 'Advanced Tier',
    description: 'Maximum limits and features',
    requirements: ['Government ID', 'Proof of Address'],
    limits: {
      daily: '₦1,000,000',
      monthly: '₦20,000,000'
    },
    tier: KYCTier.INTERMEDIATE
  }
];

export default function VerificationPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<KYCStatusState | null>(null);

  useEffect(() => {
    const checkKYCStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }

        const status = await KYCService.getKYCStatus(session.user.id);
        setKycStatus({
          isVerified: status.isVerified,
          tier: status.tier,
          status: status.status as KYCStatus
        });
      } catch (error) {
        console.error('Error checking KYC status:', error);
        toast({
          title: "Error",
          description: "Failed to check verification status. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkKYCStatus();
  }, [router, supabase, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-600">Identity Verification</h1>
        <p className="text-muted-foreground">
          Complete verification to unlock higher limits and more features.
          You can still access your wallet and receive crypto while verification is in progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIER_INFO.map((tier) => {
          const currentTier = kycStatus?.tier ?? KYCTier.NONE;
          const isCurrentTier = currentTier === tier.tier;
          const isCompleted = currentTier > tier.tier;
          const isPending = isCurrentTier && kycStatus?.status === 'pending';
          const canProceed = isCurrentTier && !isPending;

          return (
            <Card key={tier.title} className={cn(
              "relative",
              isCurrentTier && "border-green-500",
              isCompleted && "bg-green-50"
            )}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {tier.title}
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isPending ? (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-300" />
                  )}
                </CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {tier.requirements.map((req) => (
                      <li key={req}>{req}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Limits</h3>
                  <div className="text-sm space-y-1">
                    <p>Daily: {tier.limits.daily}</p>
                    <p>Monthly: {tier.limits.monthly}</p>
                  </div>
                </div>
                {canProceed && TIER_ROUTES[tier.tier] && kycStatus && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => router.push(TIER_ROUTES[tier.tier]!)}
                  >
                    Proceed to Verification
                  </Button>
                )}
                {isPending && (
                  <Alert className="bg-orange-50 border-orange-200">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-700 text-sm">
                      Verification in progress
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}