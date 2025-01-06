"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CopyButton } from '@/components/ui/copy-button';
import { useToast } from '@/app/hooks/use-toast';
import { VirtualAccountService } from '@/app/lib/services/virtual-account';
import { QRCode } from '@/app/components/ui/qr-code';

interface VirtualAccountDetails {
  accountNumber: string;
  accountName: string;
  bankName: string;
  reference: string;
}

export default function VirtualAccountDetails() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accountDetails, setAccountDetails] = useState<VirtualAccountDetails | null>(null);

  useEffect(() => {
    const fetchOrGenerateAccount = async () => {
      try {
        if (!session?.user?.id || !session?.user?.email) {
          throw new Error('User not authenticated');
        }

        setLoading(true);
        const virtualAccountService = VirtualAccountService.getInstance();
        
        // You'll need to get these details from user's profile or KYC data
        const phoneNumber = ''; // Get from user profile
        const bvn = ''; // Get from KYC data
        
        const response = await virtualAccountService.generateVirtualAccount(
          session.user.id,
          session.user.email,
          phoneNumber,
          bvn
        );

        if (response.status === 'success') {
          setAccountDetails(response.data);
        } else {
          throw new Error('Failed to generate virtual account');
        }
      } catch (error) {
        console.error('Error fetching virtual account:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch account details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateAccount();
  }, [session?.user?.id, session?.user?.email]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Virtual Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[180px]" />
        </CardContent>
      </Card>
    );
  }

  if (!accountDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Virtual Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to fetch account details. Please complete your KYC verification first.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.href = '/kyc'}
          >
            Complete KYC
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Virtual Account Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bank Name</span>
            <span className="font-medium">{accountDetails.bankName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account Number</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{accountDetails.accountNumber}</span>
              <CopyButton text={accountDetails.accountNumber} />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account Name</span>
            <span className="font-medium">{accountDetails.accountName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Reference</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">{accountDetails.reference}</span>
              <CopyButton text={accountDetails.reference} />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <QRCode 
            value={JSON.stringify({
              bankName: accountDetails.bankName,
              accountNumber: accountDetails.accountNumber,
              accountName: accountDetails.accountName
            })}
            size={120}
          />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Transfer to this account to fund your NGN wallet</p>
          <p className="mt-1">Funds will be credited automatically</p>
        </div>
      </CardContent>
    </Card>
  );
} 