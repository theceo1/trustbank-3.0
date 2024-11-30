export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface BaseTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'buy' | 'sell' | 'transfer' | 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  payment_reference: string;
  created_at: string;
  updated_at: string;
}

export interface CryptoTransaction extends BaseTransaction {
  type: 'buy' | 'sell';
  crypto_amount: number;
  crypto_currency: string;
  rate: number;
}

export interface FiatTransaction extends BaseTransaction {
  type: 'transfer' | 'deposit' | 'withdrawal';
}

export type Transaction = CryptoTransaction | FiatTransaction;

export interface ReferralTransaction extends BaseTransaction {
  referrer_id: string;
  commission: number;
  commission_currency: string;
  referrer: {
    email: string;
    full_name: string;
  };
  referred: {
    email: string;
    full_name: string;
  };
}

export interface TransactionFilters {
  currency?: string;
  limit?: number;
  status: string;
  dateRange: string;
}