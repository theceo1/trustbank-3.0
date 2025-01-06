//app/trade/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import MarketStats from '@/app/components/trade/MarketStats.new';
import TradeForm from '@/app/components/trade/TradeForm';
import WalletOverview from '@/app/components/trade/WalletOverview';
import { useAuth } from '@/app/context/AuthContext';

interface VerificationStatus {
  tier1: {
    verified: boolean;
    submitted: boolean;
    required: boolean;
  };
  tier2: {
    verified: boolean;
    submitted: boolean;
    available: boolean;
  };
  tier3: {
    verified: boolean;
    submitted: boolean;
    available: boolean;
  };
}

interface KYCStatus {
  verified: boolean;
  kyc_level: number;
  kyc_status: string;
  daily_limit: number;
  monthly_limit: number;
  verification_status: VerificationStatus;
}

export default function TradePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error('Please sign in to access the trading page');
      router.push('/auth/login?redirect=/trade');
      return;
    }

    // Check KYC status
    const checkKYCStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/kyc/status');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch KYC status');
        }

        setKycStatus(data);
        
        // Check if user needs to complete verification
        if (!data.verified || !data.verification_status.tier1.verified) {
          toast.error('Please complete your identity verification to access trading');
          router.push('/profile/verification');
          return;
        }

        // If verification is submitted but pending
        if (data.verification_status.tier1.submitted && !data.verification_status.tier1.verified) {
          toast.error('Your verification is pending approval. Please wait for verification to be completed.');
          router.push('/profile/verification');
          return;
        }

      } catch (error: any) {
        console.error('Error checking KYC status:', error);
        toast.error(error.message || 'Failed to verify your trading eligibility');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkKYCStatus();
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user || !kycStatus?.verified || !kycStatus.verification_status.tier1.verified) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[1fr,300px]">
        <div className="space-y-6">
          <MarketStats />
          <TradeForm />
        </div>
        <div>
          <WalletOverview />
        </div>
      </div>
    </div>
  );
}