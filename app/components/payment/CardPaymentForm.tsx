"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/app/hooks/use-toast';
import { PaystackButton } from "react-paystack";

interface CardPaymentFormProps {
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

export default function CardPaymentForm({ onSuccess, onClose }: CardPaymentFormProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters and leading zeros
    const value = e.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
    setAmount(value);
  };

  const config = {
    reference: `PAY_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
    email: session?.user?.email || '',
    amount: parseFloat(amount || '0') * 100, // Convert to kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    label: 'Fund Wallet',
    currency: 'NGN'
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      setIsProcessing(true);
      
      // Verify payment on the backend
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Payment Successful",
          description: `Your wallet has been credited with ₦${amount}`,
        });
        onSuccess?.(reference);
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to verify payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setAmount('');
    }
  };

  const handlePaymentClose = () => {
    toast({
      title: "Payment Cancelled",
      description: "You have cancelled the payment",
      variant: "destructive"
    });
    onClose?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount (NGN)</label>
          <Input
            type="text"
            value={amount ? `₦${amount}` : ''}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            disabled={isProcessing}
          />
        </div>

        <PaystackButton
          {...config}
          onSuccess={(ref: any) => handlePaymentSuccess(ref.reference)}
          onClose={handlePaymentClose}
          className="w-full"
          disabled={isProcessing || !amount || parseFloat(amount) < 100}
        >
          <Button 
            className="w-full" 
            disabled={isProcessing || !amount || parseFloat(amount) < 100}
          >
            {isProcessing ? "Processing..." : "Pay Now"}
          </Button>
        </PaystackButton>

        <p className="text-sm text-muted-foreground text-center">
          Minimum amount: ₦100
        </p>
      </CardContent>
    </Card>
  );
} 