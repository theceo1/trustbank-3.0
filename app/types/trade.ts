export enum TradeStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export type TradeType = 'buy' | 'sell';

export type PaymentMethod = 'wallet' | 'card' | 'bank_transfer' | 'crypto' | 'qr_code' | 'mobile_money';

export interface TradeDetails {
  id: string;
  user_id: string;
  price: number;
  amount: number;
  total: number;
  type: TradeType;
  timestamp: string;
  pair: string;
  currency: string;
  rate: number;
  status: TradeStatus;
  payment_method: PaymentMethod;
  created_at?: string;
  reference?: string;
  fees: {
    total: number;
    platform: number;
    processing?: number;
  };
}

export interface TradeQuote {
  id: string;
  quoted_price: number;
  expires_at: string;
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  estimatedAmount: number;
  rate: number;
  total: number;
  fees: {
    total: number;
    platform: number;
    processing: number;
  };
}

export interface TradeRateResponse {
  rate: number;
  amount: number;
  total: number;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  expiresAt: number;
}

export interface TradeParams {
  user_id: string;
  type: 'buy' | 'sell';
  currency: string;
  amount: number;
  rate: number;
  total: number;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  payment_method: PaymentMethod;
  reference: string;
}

export interface AutomatedTradeRule {
  id: string;
  user_id: string;
  type: TradeType;
  currency: string;
  amount: number;
  target_rate: number;
  expires_at: string;
  created_at: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
}
