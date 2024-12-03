import { useMemo, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PaymentMethodType } from '@/app/types/payment';
import { formatCurrency } from '@/app/lib/utils';
import { Loader2 } from 'lucide-react';
import { FeeService } from '@/app/lib/services/fees';
import { formatNumber } from '@/app/lib/utils/format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface TransactionPreviewProps {
  type: 'buy' | 'sell';
  amount: number;
  cryptoAmount: number;
  cryptoCurrency: string;
  rate: number;
  paymentMethod: PaymentMethodType;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface Fees {
  quidax: number;
  platform: number;
  processing: number;
  total: number;
}

export default function TransactionPreview({
  amount,
  cryptoAmount,
  cryptoCurrency,
  rate,
  paymentMethod,
  type,
  onConfirm,
  onCancel,
  isLoading = false,
}: TransactionPreviewProps) {
  const [fees, setFees] = useState<Fees>({
    quidax: 0,
    platform: 0,
    processing: 0,
    total: 0
  });

  useEffect(() => {
    const loadFees = async () => {
      const calculatedFees = await FeeService.calculateFees({
        user_id: 'current_user',
        currency: cryptoCurrency,
        amount: amount
      });
      const total = calculatedFees.quidax + calculatedFees.platform + calculatedFees.processing;
      setFees({ ...calculatedFees, total });
    };
    loadFees();
  }, [amount, cryptoCurrency]);

  const formattedFees = useMemo(() => ({
    quidax: formatCurrency(fees.quidax),
    platform: formatCurrency(fees.platform),
    processing: formatCurrency(fees.processing)
  }), [fees]);

  const total = useMemo(() => {
    return type === 'buy' ? amount + fees.total : amount - fees.total;
  }, [amount, fees.total, type]);

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Trade</DialogTitle>
          <DialogDescription>
            Please review your {type} order details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Amount</span>
              <span className="font-medium">
                ₦{formatNumber(amount)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Crypto Amount</span>
              <span className="font-medium">
                {formatNumber(cryptoAmount)} {cryptoCurrency.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Exchange Rate</span>
              <span className="font-medium">
                ₦{formatNumber(rate)}/$
              </span>
            </div>

            <Separator className="my-2" />

            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Exchange Fee</span>
                <span>{formattedFees.quidax}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service Fee</span>
                <span>{formattedFees.platform}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing Fee</span>
                <span>{formattedFees.processing}</span>
              </div>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between font-medium">
              <span>Total {type === 'buy' ? 'Pay' : 'Receive'}</span>
              <span className="text-lg">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}