import { useState } from 'react';
import { useToast } from '@/app/components/ui/use-toast';

export function useKYC() {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const checkKYCStatus = async () => {
    try {
      setIsVerifying(true);
      const response = await fetch('/api/kyc/status');
      const data = await response.json();

      if (!data.verified) {
        toast({ 
          id: 'kyc-required',
          title: "KYC Required",
          description: "Please complete your KYC verification to proceed",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      toast({
        id: 'kyc-error',
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