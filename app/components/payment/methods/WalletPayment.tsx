import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentProcessorProps, PaymentResult } from '@/app/types/payment';
import { WalletService } from '@/app/lib/services/wallet';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/app/lib/utils';

export default function WalletPayment({ trade, onComplete }: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const hasInsufficientBalance = trade.amount > (trade.walletBalance || 0);

  const handlePayment = async () => {
    if (hasInsufficientBalance) {
      toast({
        id: 'insufficient-balance',
        title: "Insufficient Balance",
        description: "Please top up your wallet to continue",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await WalletService.processPayment({
        amount: trade.amount,
        currency: trade.currency,
        tradeId: trade.id
      });
      
      const paymentResult: PaymentResult = {
        status: 'completed',
        trade_id: trade.id,
        reference: result.reference
      };
      
      onComplete(paymentResult);
      toast({
        id: 'payment-successful',
        title: "Payment Successful",
        description: "Your wallet has been debited successfully"
      });
    } catch (error) {
      toast({
        id: 'payment-failed',
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="font-semibold">Pay from Wallet</h3>
          <p className="text-sm text-gray-500">
            Available Balance: {formatCurrency(trade.walletBalance || 0)}
          </p>
          {hasInsufficientBalance && (
            <p className="text-sm text-red-500">
              Insufficient balance for this transaction
            </p>
          )}
        </div>

        <Button 
          onClick={handlePayment}
          disabled={isProcessing || hasInsufficientBalance}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Confirm Payment"}
        </Button>
      </CardContent>
    </Card>
  );
}