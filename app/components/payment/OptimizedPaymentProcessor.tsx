import { Suspense, lazy } from 'react';
import { usePaymentOptimization } from '@/app/hooks/usePaymentOptimization';
import { PaymentLoadingState } from '../ui/loading/PaymentLoadingState';
import { PaymentProcessorProps, PaymentMethodType } from '@/app/types/payment';

const WalletPayment = lazy(() => import('@/app/components/payment/methods/WalletPayment'));
const CardPayment = lazy(() => import('@/app/components/payment/methods/CardPayment'));
const BankTransferPayment = lazy(() => import('@/app/components/payment/methods/BankTransferPayment'));
const CryptoPayment = lazy(() => import('@/app/components/payment/methods/CryptoPayment'));
const QRCodePayment = lazy(() => import('@/app/components/payment/methods/QRCodePayment'));
const MobileMoneyPayment = lazy(() => import('@/app/components/payment/methods/MobileMoneyPayment'));

const PaymentComponents: Record<PaymentMethodType, React.LazyExoticComponent<React.ComponentType<PaymentProcessorProps>>> = {
  wallet: WalletPayment,
  card: CardPayment,
  bank_transfer: BankTransferPayment,
  crypto: CryptoPayment,
  qr_code: QRCodePayment,
  mobile_money: MobileMoneyPayment
};

export function OptimizedPaymentProcessor({
  trade,
  onComplete
}: PaymentProcessorProps) {
  const { isOptimized, avgProcessingTime } = usePaymentOptimization(
    trade.payment_method || 'wallet'
  );

  const PaymentComponent = PaymentComponents[trade.payment_method || 'wallet'];

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