// app/components/payment/methods/WalletPayment.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentProcessorProps, PaymentResult, PaymentStatus } from '@/app/types/payment';
import { PaymentProcessorFactory } from '@/app/lib/services/payment/PaymentProcessorFactory';
import { WalletService } from '@/app/lib/services/wallet';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/app/lib/utils';

export default function WalletPayment({ trade, onComplete }: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (trade.user_id) {
        try {
          const userBalance = await WalletService.getUserBalance(trade.user_id);
          setBalance(userBalance);
        } catch (error) {
          console.error('Failed to fetch wallet balance:', error);
        }
      }
    };
    
    fetchBalance();
  }, [trade.user_id]);

  const hasInsufficientBalance = trade.amount > balance;

  const handlePayment = async () => {
    if (!trade.id) {
      toast({
        id: 'invalid-trade',
        title: "Invalid Trade",
        description: "Trade details are incomplete",
        variant: "destructive"
      });
      return;
    }

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
      const walletProcessor = PaymentProcessorFactory.getProcessor('wallet');
      const result = await walletProcessor.process(trade);
      
      const paymentResult: PaymentResult = {
        status: result.status as PaymentStatus,
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
            Available Balance: {formatCurrency(balance)}
          </p>
          {hasInsufficientBalance && (
            <p className="text-sm text-red-500">
              Insufficient balance for this transaction
            </p>
          )}
        </div>

        <Button 
          onClick={handlePayment}
          disabled={isProcessing || hasInsufficientBalance || !trade.id}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Confirm Payment"}
        </Button>
      </CardContent>
    </Card>
  );
}