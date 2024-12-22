// app/lib/services/tradeStatus.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { QuidaxService } from './quidax';
import { PaymentService } from './payment';
import { PaymentProcessorFactory } from './payment/PaymentProcessorFactory';
import { PaymentMethodType, PaymentStatus } from '@/app/types/payment';

export class TradeStatusService {
  static async watchStatus(
    tradeId: string,
    onStatusChange: (status: TradeStatus) => void,
    interval = 5000
  ): Promise<() => void> {
    const supabase = createClientComponentClient();
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/trades/status?tradeId=${tradeId}`);
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        const paymentStatus = QuidaxService.mapQuidaxStatus(data.status);
        const tradeStatus = this.mapPaymentStatusToTradeStatus(paymentStatus);
        onStatusChange(tradeStatus);
        
        return tradeStatus === TradeStatus.COMPLETED || tradeStatus === TradeStatus.FAILED;
      } catch (error) {
        console.error('Status check failed:', error);
        return false;
      }
    };

    const intervalId = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) clearInterval(intervalId);
    }, interval);

    // Initial check
    checkStatus();

    // Cleanup function
    return () => clearInterval(intervalId);
  }

  private static mapPaymentStatusToTradeStatus(status: PaymentStatus): TradeStatus {
    const statusMap: Record<PaymentStatus, TradeStatus> = {
      'initiated': TradeStatus.PENDING,
      'pending': TradeStatus.PENDING,
      'processing': TradeStatus.PROCESSING,
      'confirming': TradeStatus.PROCESSING,
      'completed': TradeStatus.COMPLETED,
      'failed': TradeStatus.FAILED
    };
    return statusMap[status] || TradeStatus.FAILED;
  }

  static async verifyPayment(trade: TradeDetails): Promise<TradeStatus> {
    try {
      const processor = PaymentProcessorFactory.getProcessor(trade.payment_method as PaymentMethodType);
      const result = await processor.verifyPayment(trade.reference!);
      
      return TradeStatus.PENDING;
    } catch (error) {
      console.error('Payment verification error:', error);
      return TradeStatus.FAILED;
    }
  }
}