import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { TrustBankLogo } from '@/app/components/brand/Logo';
import { formatCurrency } from '@/lib/utils';
import { PaymentStatusAnimationProps } from '@/app/types/transaction';

export function PaymentStatusAnimation({ 
  status, 
  amount, 
  currency 
}: PaymentStatusAnimationProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="text-center space-y-6 py-8"
      >
        <TrustBankLogo className="h-8 mx-auto" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 mx-auto"
        >
          {status === 'success' ? (
            <div className="text-green-500">
              <CheckCircle size={80} className="w-full h-full" />
            </div>
          ) : (
            <div className="text-red-500">
              <XCircle size={80} className="w-full h-full" />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h3 className="text-2xl font-semibold">
            {status === 'success' ? 'Payment Successful' : 'Payment Failed'}
          </h3>
          <p className="text-xl font-medium">
            {formatCurrency(amount, currency)}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}