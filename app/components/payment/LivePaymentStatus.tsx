import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentWebSocket } from '@/app/lib/services/realtime/PaymentWebSocket';
import { PaymentStatusAnimation } from '../ui/feedback/PaymentStatusAnimation';
import { SecurityBadge } from '../ui/security-badge';
import { LivePaymentStatusProps, PaymentStatus as PaymentStatusType } from '@/app/types/payment';

interface PaymentStatusAnimationProps {
  status: 'success' | 'error';
  amount: number;
  currency: string;
}

export function LivePaymentStatus({ 
  tradeId,
  initialStatus,
  amount,
  currency,
  onStatusChange 
}: LivePaymentStatusProps) {
  const [status, setStatus] = useState(initialStatus);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const cleanup = PaymentWebSocket.subscribeToPaymentUpdates(
      tradeId,
      (newStatus) => {
        setStatus(newStatus);
        setLastUpdate(new Date());
        onStatusChange?.(newStatus);
      }
    );

    return cleanup;
  }, [tradeId, onStatusChange]);

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          <PaymentStatusAnimation 
            status={['completed'].includes(status) ? 'success' : 'error'}
            amount={amount}
            currency={currency}
          />
          
          <div className="text-center text-sm text-gray-500">
            <p>Last updated: {formatTimeAgo(lastUpdate)}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <SecurityBadge className="mt-6" />
    </div>
  );
}