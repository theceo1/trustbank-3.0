import { Suspense, lazy } from 'react';
import { usePaymentOptimization } from '@/app/hooks/usePaymentOptimization';
import { PaymentLoadingState } from '../ui/loading/PaymentLoadingState';
import { PaymentProcessorProps } from '@/app/types/payment';

const WalletPayment = lazy(() => import('./methods/WalletPayment'));
const CardPayment = lazy(() => import('./methods/CardPayment'));
const BankTransferPayment = lazy(() => import('./methods/BankTransferPayment'));

export function OptimizedPaymentProcessor({
  trade,
  onComplete
}: PaymentProcessorProps) {
  const { isOptimized, avgProcessingTime } = usePaymentOptimization(
    trade.payment_method
  );

  const PaymentComponent = {
    wallet: WalletPayment,
    card: CardPayment,
    bank_transfer: BankTransferPayment
  }[trade.payment_method] as React.ComponentType<any>;

  const formatTime = (time: number): string => {
    return time < 60 
      ? `${time} seconds`
      : `${Math.round(time / 60)} minutes`;
  };

  return (
    <div className="space-y-4">
      {avgProcessingTime && (
        <div className="text-sm text-gray-500 text-center">
          Estimated processing time: {formatTime(avgProcessingTime)}
        </div>
      )}

      <Suspense fallback={<PaymentLoadingState />}>
        <PaymentComponent
          trade={trade}
          onComplete={onComplete}
          isOptimized={isOptimized}
        />
      </Suspense>

      <div className="text-center">
        <small className="text-gray-500">
          Secured by trustBank&apos;s Advanced Payment System
        </small>
      </div>
    </div>
  );
}