import { TradeDetails } from '@/app/types/trade';

export interface PaymentProcessorResult {
  success: boolean;
  reference: string;
  status: string;
  redirect_url?: string;
  metadata?: Record<string, any>;
}

export abstract class BasePaymentProcessor {
  abstract validatePayment(details: TradeDetails): Promise<void>;
  abstract initializePayment(details: PaymentInitDetails): Promise<PaymentProcessorResult>;
  abstract process(trade: TradeDetails): Promise<PaymentProcessorResult>;
  abstract verifyPayment(reference: string): Promise<PaymentProcessorResult>;
}

export interface PaymentInitDetails {
  trade_id: string;
  amount: number;
  currency: string;
  user_id: string;
  quidax_reference: string;
}