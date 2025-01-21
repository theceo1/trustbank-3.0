export type TradeStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export type TradeType = 'buy' | 'sell';

export type PaymentMethod = 'swap' | 'bank_transfer' | 'card';

export interface TradeDetails {
  id: string;
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
  fees: {
    total: number;
    platform: number;
    processing: number;
  };
}
