// app/lib/services/tradeStatus.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradeDetails, TradeStatus } from '@/app/types/trade';
import { QuidaxSwapService } from './quidax-swap';
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
        
        const paymentStatus = QuidaxSwapService.mapQuidaxStatus(data.status);
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

  static async updateTradeStatus(tradeId: string, paymentStatus: PaymentStatus) {
    const tradeStatus = this.mapPaymentStatusToTradeStatus(paymentStatus);
    
    // Update trade status in database
    const response = await fetch(`/api/trades/${tradeId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: tradeStatus })
    });

    if (!response.ok) {
      throw new Error('Failed to update trade status');
    }

    return tradeStatus;
  }

  private static mapPaymentStatusToTradeStatus(paymentStatus: PaymentStatus): TradeStatus {
    const statusMap: Record<PaymentStatus, TradeStatus> = {
      'initiated': TradeStatus.PENDING,
      'pending': TradeStatus.PENDING,
      'processing': TradeStatus.PROCESSING,
      'completed': TradeStatus.COMPLETED,
      'failed': TradeStatus.FAILED
    };

    return statusMap[paymentStatus] || TradeStatus.FAILED;
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