import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentProcessorProps } from '@/app/types/payment';
import { BankService } from '@/app/lib/services/bank';
import { CopyButton } from '@/app/components/ui/copy-button';
import { QRCode } from '@/app/components/ui/qr-code';

export default function BankTransferPayment({ trade, onComplete }: PaymentProcessorProps) {
  const [bankDetails, setBankDetails] = useState<{
    accountNumber: string;
    accountName: string;
    bankName: string;
    reference: string;
  }>();

  useEffect(() => {
    const initializeTransfer = async () => {
      const details = await BankService.generateTransferDetails(trade);
      setBankDetails(details);
    };
    
    initializeTransfer();
  }, [trade]);

  if (!bankDetails) return null;

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="text-center">
          <h3 className="font-semibold">Bank Transfer Details</h3>
          <p className="text-sm text-gray-500">
            Transfer exactly {trade.amount} {trade.currency}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Bank Name</span>
            <span className="font-medium">{bankDetails.bankName}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Account Number</span>
            <div className="flex items-center space-x-2">
              <span className="font-medium">{bankDetails.accountNumber}</span>
              <CopyButton text={bankDetails.accountNumber} />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Account Name</span>
            <span className="font-medium">{bankDetails.accountName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Reference</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-medium">{bankDetails.reference}</span>
              <CopyButton text={bankDetails.reference} />
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <QRCode 
            value={JSON.stringify(bankDetails)}
            size={120}
          />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Payment will be confirmed automatically once received</p>
        </div>
      </CardContent>
    </Card>
  );
}