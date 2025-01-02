import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface VerificationStatusProps {
  verificationStatus: {
    tier1_verified: boolean;
    tier2_verified: boolean;
    tier3_verified: boolean;
    tier1_submitted?: boolean;
    tier2_submitted?: boolean;
    tier3_submitted?: boolean;
  };
  className?: string;
}

const TIER_LIMITS = {
  tier1: {
    daily: '50,000 NGN',
    monthly: '500,000 NGN',
    requirements: ['Email verification', 'Phone verification']
  },
  tier2: {
    daily: '2,000,000 NGN',
    monthly: '20,000,000 NGN',
    requirements: ['Government ID', 'Proof of address', 'Selfie verification']
  },
  tier3: {
    daily: '10,000,000 NGN',
    monthly: '100,000,000 NGN',
    requirements: ['Bank statement', 'Source of funds', 'Video verification']
  }
};

export function VerificationStatus({ verificationStatus, className = '' }: VerificationStatusProps) {
  const getTierStatus = (tier: 1 | 2 | 3) => {
    const isVerified = verificationStatus[`tier${tier}_verified` as keyof typeof verificationStatus];
    const isSubmitted = verificationStatus[`tier${tier}_submitted` as keyof typeof verificationStatus];

    if (isVerified) {
      return {
        status: 'verified',
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        text: 'Verified',
        buttonText: 'Completed',
        buttonDisabled: true
      };
    }

    if (isSubmitted) {
      return {
        status: 'pending',
        icon: <AlertCircle className="h-6 w-6 text-yellow-500" />,
        text: 'Under Review',
        buttonText: 'Pending Review',
        buttonDisabled: true
      };
    }

    return {
      status: 'unverified',
      icon: <XCircle className="h-6 w-6 text-gray-400" />,
      text: 'Not Verified',
      buttonText: 'Start Verification',
      buttonDisabled: false,
      href: `/verification/tier${tier}`
    };
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Verification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3].map((tier) => {
          const tierStatus = getTierStatus(tier as 1 | 2 | 3);
          const tierInfo = TIER_LIMITS[`tier${tier}` as keyof typeof TIER_LIMITS];

          return (
            <div key={tier} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {tierStatus.icon}
                  <div>
                    <h3 className="font-semibold">Level {tier}</h3>
                    <p className="text-sm text-gray-500">{tierStatus.text}</p>
                  </div>
                </div>
                {tierStatus.href ? (
                  <Link href={tierStatus.href}>
                    <Button
                      variant={tierStatus.status === 'verified' ? 'outline' : 'default'}
                      disabled={tierStatus.buttonDisabled}
                    >
                      {tierStatus.buttonText}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant={tierStatus.status === 'verified' ? 'outline' : 'default'}
                    disabled={tierStatus.buttonDisabled}
                  >
                    {tierStatus.buttonText}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Daily Limit</span>
                  <span className="font-medium">{tierInfo.daily}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Monthly Limit</span>
                  <span className="font-medium">{tierInfo.monthly}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Requirements:</h4>
                <ul className="text-sm text-gray-500 list-disc list-inside">
                  {tierInfo.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
} 