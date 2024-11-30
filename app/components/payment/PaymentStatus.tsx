"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export function PaymentStatus() {
  const { id } = useParams();
  const [status, setStatus] = useState('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const checkStatus = async () => {
      const response = await fetch(`/api/trades/${id}/status`);
      const data = await response.json();
      setStatus(data.status);
      setPaymentDetails(data.payment_details);

      if (!['completed', 'failed'].includes(data.status)) {
        setTimeout(checkStatus, 5000);
      }
    };

    checkStatus();
  }, [id]);

  const renderStatusContent = () => {
    switch (status) {
      case 'pending':
        return (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Processing Payment</AlertTitle>
            <AlertDescription>
              Please wait while we confirm your payment...
            </AlertDescription>
          </Alert>
        );
      case 'completed':
        return (
          <Alert className="bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Payment Successful</AlertTitle>
            <AlertDescription>
              Your trade has been processed successfully.
              Reference: {paymentDetails?.reference}
            </AlertDescription>
          </Alert>
        );
      case 'failed':
        return (
          <Alert className="bg-red-50">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertTitle>Payment Failed</AlertTitle>
            <AlertDescription>
              There was an error processing your payment.
              Please try again or contact support.
            </AlertDescription>
            <Button variant="outline" className="mt-4">
              Try Again
            </Button>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {renderStatusContent()}
    </div>
  );
}