import { PaymentProcessorProps } from '@/app/types/payment';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function CryptoPayment({ trade, onComplete, isOptimized }: PaymentProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // TODO: Implement crypto payment logic
      onComplete({
        status: 'completed',
        trade_id: trade.id!,
        reference: trade.reference!
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process crypto payment",
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
          <h3 className="font-semibold">Pay with Cryptocurrency</h3>
          <p className="text-sm text-gray-500">
            Coming Soon
          </p>
        </div>

        <Button 
          onClick={handlePayment}
          disabled={true}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </CardContent>
    </Card>
  );
} 