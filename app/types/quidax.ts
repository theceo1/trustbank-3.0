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
    price: {
      unit: string;
      amount: string;
    };
    volume: {
      unit: string;
      amount: string;
    };
    total: {
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
    user: {
      email: string;
    };
    from_currency: string;
    to_currency: string;
    from_amount: string;
    received_amount: string;
    execution_price: string;
    swap_quotation: {
      id: string;
      rate: string;
      expires_at: string;
    };
  }
  
  export interface QuidaxWebhookEvent {
    event: string;
    data: QuidaxWalletUpdate | QuidaxInstantOrder | QuidaxDeposit | QuidaxSwapTransaction;
  }
  
  // Add other interfaces as needed
