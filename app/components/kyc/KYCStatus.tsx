import { useEffect, useState } from 'react';
import { KYCService } from '@/app/lib/services/kyc';
import { KYCStatusType } from '@/app/types/kyc';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { KYCStatusBadge } from '@/app/components/kyc/KYCStatusBadge';
import { useToast } from '@/hooks/use-toast';

interface KYCStatusProps {
  userId: string;
  showAction?: boolean;
}

export default function KYCStatus({ userId, showAction = true }: KYCStatusProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<KYCStatusType>('unverified');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const eligibility = await KYCService.isEligibleForTrade(userId);
        setStatus(eligibility.eligible ? 'verified' : 'unverified');
      } catch (error) {
        toast({
          id: 'kyc-status-error',
          title: 'Error',
          description: 'Failed to fetch KYC status',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [userId, toast]);

  if (isLoading) return null;

  return (
    <div className="flex items-center gap-4">
      <KYCStatusBadge status={status} />
      {showAction && status !== 'verified' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/profile/kyc')}
        >
          Complete KYC
        </Button>
      )}
    </div>
  );
}