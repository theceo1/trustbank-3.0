"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PaymentService } from '@/app/lib/services/payment';
import { PaymentStatus } from '@/app/types/payment';

interface PaymentStatusMonitorProps {
  tradeId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function PaymentStatusMonitor({
  tradeId,
  onComplete,
  onError
}: PaymentStatusMonitorProps) {
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [progress, setProgress] = useState(0);

  const statusToProgress = useMemo<Record<PaymentStatus, number>>(() => ({
    initiated: 0,
    pending: 25,
    processing: 50,
    confirming: 75,
    completed: 100,
    failed: 0
  }), []);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const MAX_ATTEMPTS = 60;

    const checkStatus = async () => {
      try {
        const currentStatus = await PaymentService.getPaymentStatus(tradeId);
        if (!mounted) return;

        setStatus(currentStatus);
        setProgress(statusToProgress[currentStatus]);

        if (currentStatus === 'completed') {
          onComplete();
        } else if (currentStatus === 'failed') {
          onError('Payment failed. Please try again.');
        } else if (attempts >= MAX_ATTEMPTS) {
          onError('Payment timeout. Please contact support.');
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    };

    const intervalId = setInterval(() => {
      attempts++;
      checkStatus();
    }, 5000);

    checkStatus();

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [tradeId, onComplete, onError, statusToProgress]);

  return (
    <Card className="p-6 space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <Progress value={progress} />
        <p className="text-center text-sm">
          {status === 'pending' && 'Processing your payment...'}
          {status === 'completed' && 'Payment completed successfully!'}
          {status === 'failed' && 'Payment failed. Please try again.'}
        </p>
      </motion.div>
    </Card>
  );
}