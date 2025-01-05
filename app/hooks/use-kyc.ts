// app/hooks/use-kyc.ts
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { KYCTier } from '@/app/types/kyc';

export function useKYC() {
  const { toast } = useToast();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();

  const checkKYCStatus = async () => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/kyc/status');
      if (!response.ok) {
        throw new Error('Failed to check KYC status');
      }

      const data = await response.json();
      return data.verified;
    } catch (error) {
      console.error('KYC check failed:', error);
      return false;
    }
  };

  const checkTradeLimits = async (amount: number) => {
    if (!user) return { allowed: false, reason: 'Authentication required' };
  
    try {
      const response = await fetch('/api/kyc/trade-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to check trade limits');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Trade limit check failed:', error);
      return { 
        allowed: false, 
        reason: 'Failed to verify trade limits'
      };
    }
  };

  const redirectToVerification = () => {
    router.push('/profile/verification');
  };

  return {
    checkKYCStatus,
    checkTradeLimits,
    redirectToVerification,
    isVerifying
  };
}