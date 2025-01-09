// app/components/payment/methods/CardPayment.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentProcessor } from '@/app/lib/services/paymentProcessor';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';
import { TradeService } from '@/app/lib/services/trade';
import { PaymentService } from '@/app/lib/services/payment/PaymentService';
import { PaymentProcessorProps } from '@/app/types/payment';

export default function CardPayment({ trade, onComplete }: PaymentProcessorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      setError('Please log in to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await PaymentService.processPayment(
        trade.amount,
        trade.currency,
        'card',
        { trade_id: trade.id }
      );

      // Check payment status
      if (result.status === 'success') {
        toast.success('Payment successful');
        onComplete(result);
        return;
      }

      // If payment requires redirect
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
        return;
      }

      // Handle pending status
      if (result.status === 'pending') {
        toast('Payment is being processed', {
          description: 'We will notify you once the payment is complete'
        });
        return;
      }

      setError('Payment failed. Please try again.');
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
          {error}
        </div>
      )}
      <Button 
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Processing..." : "Proceed to Payment"}
      </Button>
    </div>
  );
}