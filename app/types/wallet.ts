export interface Wallet {
    id: string;
    user_id: string;
    balance: number;
    pending_balance: number;
    total_deposits: number;
    total_withdrawals: number;
    last_transaction_at: string;
    created_at: string;
    updated_at: string;
}