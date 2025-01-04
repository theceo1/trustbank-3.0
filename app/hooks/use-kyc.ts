// app/hooks/use-kyc.ts
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { KYCService } from '@/app/lib/services/kyc';
import { KYCTier } from '@/app/types/kyc';

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
  
    const status = await KYCService.getKYCStatus(user.id);
    if (!status.isVerified) {
      return { allowed: false, reason: 'KYC verification required' };
    }
  
    if (amount > status.limits.dailyLimit) {
      return {
        allowed: false,
        reason: `Amount exceeds your daily limit of ₦${status.limits.dailyLimit.toLocaleString()}. Please upgrade your KYC level.`
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