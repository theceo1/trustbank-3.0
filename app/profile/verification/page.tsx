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
import { Loader2, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KYCStatusState {
  isVerified: boolean;
  tier: KYCTier;
  status: KYCStatus;
}

const TIER_ROUTES: Record<KYCTier, string | undefined> = {
  [KYCTier.NONE]: '/profile/verification/kyc/nin',
  [KYCTier.BASIC]: '/profile/verification/kyc/bvn',
  [KYCTier.INTERMEDIATE]: '/profile/verification/kyc/photo-id',
  [KYCTier.ADVANCED]: undefined,
};

const TIER_NAMES: Record<KYCTier, string> = {
  [KYCTier.NONE]: 'Unverified',
  [KYCTier.BASIC]: 'Basic',
  [KYCTier.INTERMEDIATE]: 'Intermediate',
  [KYCTier.ADVANCED]: 'Advanced',
};

const STATUS_STYLES = {
  pending: 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse',
  approved: 'bg-green-600 text-white border-green-700',
  verified: 'bg-green-600 text-white border-green-700',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  unverified: 'bg-gray-100 text-gray-700 border-gray-200'
};

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

        // Show appropriate toast based on status
        if (status.status === 'verified' || status.status === 'approved') {
          toast({
            title: "Verification Complete",
            description: "Your identity has been verified successfully.",
          });
        } else if (status.status === 'rejected') {
          toast({
            title: "Verification Failed",
            description: "Your identity verification was not successful. Please try again.",
            variant: "destructive"
          });
        }
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

    // Poll for status updates every 30 seconds if status is pending
    const pollInterval = setInterval(() => {
      if (kycStatus?.status === 'pending') {
        checkKYCStatus();
      }
    }, 30000);

    checkKYCStatus();

    return () => clearInterval(pollInterval);
  }, [router, supabase, toast, kycStatus?.status]);

  const handleStartVerification = () => {
    if (!kycStatus) return;
    
    const nextRoute = TIER_ROUTES[kycStatus.tier];
    if (nextRoute) {
      router.push(nextRoute);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  const isVerificationComplete = kycStatus?.status === 'verified' || kycStatus?.status === 'approved';
  const isVerificationPending = kycStatus?.status === 'pending' as KYCStatus;
  const showStartButton = !isVerificationComplete && !isVerificationPending && kycStatus?.tier !== KYCTier.ADVANCED;

  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-green-600">Identity Verification</CardTitle>
          <CardDescription>
            You can still access your wallet and receive crypto while your verification is in progress. 
            Verification is only required for trading.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Current Tier</p>
              <p className="text-sm text-muted-foreground">
                {kycStatus ? TIER_NAMES[kycStatus.tier] : 'Loading...'}
              </p>
            </div>
            {kycStatus?.status && (
              <Badge 
                className={cn(
                  "px-4 py-1 capitalize transition-all duration-300",
                  STATUS_STYLES[kycStatus.status]
                )}
              >
                {kycStatus.status}
              </Badge>
            )}
          </div>

          {isVerificationPending && (
            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-600">Verification in Progress</AlertTitle>
              <AlertDescription className="text-orange-700">
                Your identity verification is being processed. This usually takes a few minutes.
                You can still access your wallet and receive crypto while waiting.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus?.status === 'rejected' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>
                Your identity verification was not successful. Please try again with valid documents.
                You can still access your wallet and receive crypto.
              </AlertDescription>
            </Alert>
          )}

          {isVerificationComplete && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">
                {kycStatus.tier === KYCTier.ADVANCED 
                  ? 'All Verifications Complete'
                  : 'Current Level Verified'}
              </AlertTitle>
              <AlertDescription className="text-green-700">
                {kycStatus.tier === KYCTier.ADVANCED 
                  ? 'You have completed all verification levels and have full access to all features.'
                  : 'You can now proceed to the next verification level to increase your limits.'}
              </AlertDescription>
            </Alert>
          )}

          {showStartButton && (
            <div className="flex justify-center">
              <Button 
                size="lg"
                onClick={handleStartVerification}
                className="bg-green-600 hover:bg-green-700 transition-colors duration-300"
              >
                {kycStatus?.tier === KYCTier.NONE 
                  ? 'Start Verification'
                  : 'Continue to Next Level'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex justify-center">
            <Button 
              variant="outline"
              size="lg"
              onClick={() => router.push('/dashboard')}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}