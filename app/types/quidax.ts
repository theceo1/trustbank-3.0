// Base types
export interface QuidaxUser {
  id: string;
  sn: string;
  email: string;
  reference: string | null;
  first_name: string;
  last_name: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuidaxAmount {
  unit: string;
  amount: string;
}

export interface QuidaxWalletUpdate {
  id: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  user: QuidaxUser;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  created_at: string;
  updated_at: string;
  deposit_address?: string;
  destination_tag?: string | null;
}

export interface QuidaxInstantOrder {
  id: string;
  reference: string | null;
  market: {
    id: string;
    base_unit: string;
    quote_unit: string;
  };
  side: 'buy' | 'sell';
  price: QuidaxAmount;
  volume: QuidaxAmount;
  total: QuidaxAmount;
  fee: QuidaxAmount;
  receive: QuidaxAmount;
  status: string;
  created_at: string;
  updated_at: string;
  user: QuidaxUser;
}

export interface QuidaxDeposit {
  id: string;
  type: string;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  status: string;
  created_at: string;
  done_at: string | null;
  wallet: QuidaxWalletUpdate;
  user: QuidaxUser;
}

export interface QuidaxSwapTransaction {
  id: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  received_amount: string;
  execution_price: string;
  status: 'initiated' | 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  swap_quotation: QuidaxQuotation;
  user: QuidaxUser;
}

export interface QuidaxQuotationParams {
  user_id: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  type?: 'instant';
  payment_method?: 'wallet' | 'card' | 'bank_transfer';
}

export interface QuidaxQuotation {
  id: string;
  from_currency: string;
  to_currency: string;
  quoted_price: string;
  quoted_currency: string;
  from_amount: string;
  to_amount: string;
  confirmed: boolean;
  expires_at: string;
  created_at: string;
  updated_at: string;
  user: QuidaxUser;
}

export interface QuidaxTemporaryQuotation {
  price: QuidaxAmount;
  total: QuidaxAmount;
  volume: QuidaxAmount;
  fee: QuidaxAmount;
  receive: QuidaxAmount;
}

export interface QuidaxWallet {
  id: string;
  currency: string;
  balance: string;
  locked: string;
  deposit_address?: string;
  destination_tag?: string | null;
  reference_currency: string;
  is_crypto: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuidaxMarketData {
  market_name?: string;
  base_unit?: string;
  quote_unit?: string;
  last_price?: number;
  high_24h?: number;
  low_24h?: number;
  volume_24h?: number;
  price_change_24h?: number;
}

export interface QuidaxWebhookEvent {
  event: string;
  data: QuidaxWalletUpdate | QuidaxInstantOrder | QuidaxDeposit | QuidaxSwapTransaction;
}

// Type aliases for backward compatibility
export type SwapQuotation = QuidaxQuotation;
export type SwapTransaction = QuidaxSwapTransaction;
export type TemporaryQuotation = QuidaxTemporaryQuotation;
export type SwapQuotationParams = QuidaxQuotationParams;