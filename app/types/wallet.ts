export interface Wallet {
    id: string;
    user_id: string;
    balance: number;
    pending_balance: number;
    currency: string;
    last_transaction_at: string | null;
    created_at: string;
    updated_at: string;
    total_deposits: number;
    total_withdrawals: number;
  }