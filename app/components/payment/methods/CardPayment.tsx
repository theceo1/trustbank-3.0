// app/components/payment/methods/CardPayment.tsx
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentProcessorProps } from '@/app/types/payment';
import { PaymentProcessor } from '@/app/lib/services/paymentProcessor';
import { useToast } from '@/hooks/use-toast';

export default function CardPayment({ trade, onComplete }: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!trade.id) {
      toast({
        id: 'payment-invalid',
        title: "Invalid Trade",
        description: "Trade details are incomplete",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await PaymentProcessor.initializePayment({
        ...trade,
        payment_method: 'card',
        reference: `CARD_${trade.id}_${Date.now()}`
      });

      // Redirect to payment page if URL is provided
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