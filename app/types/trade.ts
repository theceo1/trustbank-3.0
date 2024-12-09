// app/types/trade.ts
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
    platform: number;
    processing: number;
    total: number;
  };
  payment_method: PaymentMethodType;
  status: TradeStatus;
  quidax_id?: string;
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
  data: {
    amount: string;
    total: string;
    fee: string;
    rate: string;
  };
}

export interface QuidaxTradeResponse {
  id: string;
  status: string;
  amount: string;
  fee: string;
  total: string;
}

export interface CreateTradeParams {
  amount: string;
  currency_pair: string;
  type: 'buy' | 'sell';
}

export type TradeActionType = 'buy' | 'sell' | 'send' | 'receive' | 'swap';

export interface QuidaxRateParams {
  amount: string;
  currency_pair: string;
  type: 'buy' | 'sell';
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

export interface GetRateParams {
  amount: string;
  currency_pair: string;
  type: string;
}