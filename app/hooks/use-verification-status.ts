import { useState, useEffect } from 'react';
import { KYCService } from '@/app/lib/services/kyc';

export function useVerificationStatus(userId: string | undefined) {
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const history = await KYCService.getVerificationHistory(userId);
        setVerificationHistory(history);
      } catch (error) {
        console.error('Error fetching verification history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const lastVerification = verificationHistory[0];
  const isPending = lastVerification?.status === 'pending';
  const isFailed = lastVerification?.status === 'failed';
  const isVerified = lastVerification?.status === 'success';

  return {
    verificationHistory,
    isLoading,
    isPending,
    isFailed,
    isVerified,
    lastVerification
  };
} 