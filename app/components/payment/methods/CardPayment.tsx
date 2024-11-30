import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentProcessorProps } from '@/app/types/payment';
import { QuidaxService } from '@/app/lib/services/quidax';
import { useToast } from '@/hooks/use-toast';

export default function CardPayment({ trade, onComplete }: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Initialize card payment with Quidax
      const result = await QuidaxService.initializeCardPayment({
        amount: trade.amount,
        currency: trade.currency,
        tradeId: trade.id,
        reference: trade.reference
      });

      // Redirect to Quidax's secure payment page
      if (result.payment_url) {
        window.location.href = result.payment_url;
      }
      
      onComplete(result);
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
          <h3 className="font-semibold">Pay with Card</h3>
          <p className="text-sm text-gray-500">
            You will be redirected to a secure payment page
          </p>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Proceed to Payment"}
        </Button>

        <div className="text-center text-xs text-gray-500">
          <p>Secured by Quidax Payment System</p>
        </div>
      </CardContent>
    </Card>
  );
}