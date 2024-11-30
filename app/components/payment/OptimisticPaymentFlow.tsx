import { useState, useEffect, useMemo } from 'react';
import { useOptimisticUpdate } from '@/app/hooks/useOptimisticUpdate';
import { PaymentProcessor } from '@/app/lib/services/paymentProcessor';
import { TransactionSummary } from './TransactionSummary';
import { PaymentProgressIndicator } from './PaymentProgressIndicator';
import { PaymentResult, PaymentStatus as PaymentStatusType } from '@/app/types/payment';
import { TradeDetails } from '@/app/types/trade';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

interface OptimisticPaymentFlowProps {
  trade: TradeDetails;
  onComplete: (result: PaymentResult) => void;
}

export function OptimisticPaymentFlow({ trade, onComplete }: OptimisticPaymentFlowProps) {
  const [status, setStatus] = useState<PaymentStatusType>('initiated');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const statusToProgress = useMemo(() => ({
    initiated: 0,
    processing: 50,
    completed: 100,
    failed: 0
  }), []);

  const { mutate, isLoading, error } = useOptimisticUpdate<PaymentResult>({
    mutationFn: async () => {
      return await PaymentProcessor.initializePayment(trade);
    },
    optimisticData: {
      status: 'processing',
      trade_id: trade.id!,
      reference: trade.reference
    },
    onSuccess: (data: PaymentResult) => {
      setStatus('completed');
      setProgress(statusToProgress.completed);
      toast({
        id: 'payment-success',
        title: "Payment Successful",
        description: "Your transaction has been processed successfully"
      });
      onComplete(data);
    },
    onError: () => {
      setStatus('failed');
      setProgress(statusToProgress.failed);
      toast({
        id: 'payment-failed',
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  useEffect(() => {
    setProgress(statusToProgress[status]);
  }, [status, statusToProgress]);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Progress value={progress} className="h-2" />

      <TransactionSummary 
        trade={trade}
        isLoading={isLoading}
      />

      <PaymentProgressIndicator
        status={status}
        showEstimatedTime={true}
      />

      <div className="text-center text-sm text-gray-500">
        <p>Protected by TrustBank&apos;s Secure Payment System</p>
      </div>
    </motion.div>
  );
}