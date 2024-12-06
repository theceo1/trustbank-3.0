// app/hooks/use-kyc.ts
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { KYCService } from '@/app/lib/services/kyc';
import { KYC_TIERS } from '@/app/lib/constants/kyc-tiers';

export function useKYC() {
  const { toast } = useToast();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, kycInfo } = useAuth();

  const checkKYCStatus = async () => {
    if (!user) return false;
    
    try {
      if (kycInfo && kycInfo.status === 'approved') {
        return true;
      }

      const status = await KYCService.getKYCStatus(user.id);
      return status.isVerified;
    } catch (error) {
      console.error('KYC check failed:', error);
      return false;
    }
  };

  const checkTradeLimits = async (amount: number) => {
    if (!user || !kycInfo) return { allowed: false, reason: 'KYC required' };

    const tierLimits = KYC_TIERS[kycInfo.currentTier];
    if (!tierLimits) return { allowed: false, reason: 'Invalid KYC tier' };

    if (amount > tierLimits.maxTransactionLimit) {
      return {
        allowed: false,
        reason: `Amount exceeds your tier limit of ${tierLimits.maxTransactionLimit}. Please upgrade your KYC level.`
      };
    }

    return { allowed: true };
  };

  return {
    checkKYCStatus,
    checkTradeLimits,
    currentTier: kycInfo?.currentTier
  };
}