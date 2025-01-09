// app/types/trade.ts
import { PaymentMethodType } from './payment';

export type TradeType = 'buy' | 'sell' | 'send' | 'receive' | 'swap';

export enum TradeStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface TradeRateResponse {
  rate: number;
  amount: number;
  total: number;
  fees: {
    platform: number;    // trustBank fee
    processing: number;  // Network/processing fee
    quidax: number;     // Quidax fee
    total: number;      // Combined fees
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
    platform: number;    // trustBank fee
    processing: number;  // Network/processing fee
    total: number;      // Combined fees
  };
  payment_method: PaymentMethodType;
  reference: string;
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
    platform: number;    // trustBank fee
    processing: number;  // Quidax fee
    total: number;      // Combined fee
  };
  payment_method: PaymentMethodType;
  status: TradeStatus;
  created_at?: string;
  updated_at?: string;
  reference?: string;
}

export interface TradeQuotation {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rate: number;
  estimatedAmount: number;
  fees: {
    platform: number;
    processing: number;
    total: number;
  };
  total: number;
  expiresAt: number;
  expiresIn: number;
}

export interface WalletBalance {
  [key: string]: number;
}

export interface TradeFormProps {
  walletBalance?: WalletBalance;
}

export interface AutomatedTradeRule {
  id?: string;
  user_id: string;
  currency: string;
  amount: number;
  target_rate: number;
  trade_type: 'buy' | 'sell';
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  expires_at?: Date;
  created_at?: string;
  updated_at?: string;
}