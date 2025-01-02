export interface WalletData {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  pending_balance: number;
  total_deposits: number;
  total_withdrawals: number;
  last_transaction_at: string;
}

export interface PaymentProcessResult {
  reference: string;
  status: 'completed' | 'failed';
}

export interface QuidaxWalletUpdate {
  event: string;
  data: {
    id: string;
    currency: string;
    balance: string;
    locked: string;
    staked: string;
    converted_balance: string;
    reference_currency: string;
    is_crypto: boolean;
    deposit_address?: string;
    updated_at: string;
  };
} 