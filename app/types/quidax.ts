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
  status: string;
  execution_price: string;
  from_amount: string;
  to_amount: string;
  from_currency: string;
  to_currency: string;
  created_at: string;
  updated_at: string;
  user: QuidaxUser;
  swap_quotation: QuidaxQuotation;
}

export interface QuidaxQuotationParams {
  user_id: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
}

export interface QuidaxQuotation {
  id: string;
  quoted_price: string;
  from_amount: string;
  to_amount: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface QuidaxTemporaryQuotation {
  from_currency: string;
  to_currency: string;
  from_amount: string;
  to_amount: string;
  quoted_price: string;
  quoted_currency: string;
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

export interface QuidaxRateResponse {
  price: {
    unit: string;
    amount: string;
  };
  total: {
    unit: string;
    amount: string;
  };
  volume: {
    unit: string;
    amount: string;
  };
  fee: {
    unit: string;
    amount: string;
  };
  receive: {
    unit: string;
    amount: string;
  };
}

export interface QuidaxQuote {
  price: QuidaxAmount;
  total: QuidaxAmount;
  volume: QuidaxAmount;
  fee: QuidaxAmount;
  receive: QuidaxAmount;
}

export interface QuidaxTicker {
  low: string;
  high: string;
  last: string;
  open: string;
  volume: string;
  sell: string;
  buy: string;
  at?: number;
  name?: string;
  price_change_percent?: string;
}

export interface QuidaxMarketTicker {
  at: number;
  ticker: {
    low: string;
    high: string;
    last: string;
    open: string;
    volume: string;
    sell: string;
    buy: string;
    name?: string;
    price_change_percent?: string;
  };
}

export interface QuidaxTradeCalculation {
  amount: number;
  fee: number;
  receive: number;
  rate: number;
}