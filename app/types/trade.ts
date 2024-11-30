import { PaymentMethodType } from './payment';

export type TradeType = 'buy' | 'sell' | 'send' | 'receive' | 'swap';

export enum TradeStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface TradeParams {
  user_id: string;
  type: TradeType;
  currency: string;
  amount: number;
  rate: number;
  total: number;
  fees: {
    service: number;
    network: number;
  };
  reference: string;
  paymentMethod: PaymentMethodType;
}

export interface SwapDetails {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  estimatedReceived: number;
  rate: number;
}

export interface TradeDetails {
  id?: string;
  user_id: string;
  type: TradeType;
  currency: string;
  amount: number;
  rate: number;
  total: number;
  fees: {
    quidax: number;
    platform: number;
    processing: number;
  };
  payment_method: string;
  status: string;
  walletBalance?: number;
  reference?: string;
  quidax_reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TradeRateRequest {
  amount: number;
  currency_pair: string;
  type: 'buy' | 'sell';
  bid?: string;
  ask?: string;
  unit?: string;
}

export interface TradeRateResponse {
  rate: number;
  total: number;
  fees: {
    quidax: number;    // 1.4%
    platform: number;   // 1.6%
    processing: number; // Payment method specific
  };
}

export interface QuidaxTradeResponse {
  id: string;
  status: string;
  reference: string;
  quidax_reference: string;
}

export interface CreateTradeParams extends Omit<TradeParams, 'reference'> {
  rateTimestamp?: number;
  external_reference?: string;
}

export type TradeActionType = 'buy' | 'sell' | 'send' | 'receive' | 'swap';

export interface QuidaxRateParams {
  amount: number;
  currency_pair: string;
  type: TradeType;
}

export interface OrderStatus {
  id: string;
  status: string;
  type: string;
  amount: string;
  filled_amount: string;
  price: string;
  created_at: string;
  updated_at: string;
}

export interface AutomatedTradeRule {
  id: string;
  user_id: string;
  currency: string;
  amount: number;
  target_rate: number;
  trade_type: 'buy' | 'sell';
  expires_at?: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TradeRate {
  rate: number;
  total: number;
  expiresAt?: number;
}