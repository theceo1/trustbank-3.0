// app/hooks/use-kyc.ts
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export function useKYC() {
  const { toast } = useToast();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);

  const checkKYCStatus = async () => {
    try {
      setIsVerifying(true);
      const response = await fetch('/api/kyc/status');
      const data = await response.json();

      if (!data.verified) {
        toast({
          title: "KYC Required",
          description: "Please complete your KYC verification to proceed",
          variant: "destructive"
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        router.push('/profile/verification');
        return false;
      }

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify KYC status",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return { checkKYCStatus, isVerifying };
}