export const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

export interface QuidaxUser {
  id: string;
  email: string;
  is_verified: boolean;
  kyc_status: string;
  first_name?: string;
  last_name?: string;
}

export interface QuidaxWallet {
  id: string;
  currency: string;
  balance: string;
  locked: string;
}

export interface SwapQuotation {
  id: string;
  status: string;
  base: string;
  quote: string;
  amount: string;
  side: string;
  price: string;
  fee: string;
  total: string;
  expires_at: string;
}

export interface SwapResponse {
  id: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  received_amount: string;
  execution_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  swap_quotation: SwapQuotation;
  user: {
    id: string;
    sn: string;
    email: string;
    reference: string | null;
    first_name: string;
    last_name: string;
    display_name: string;
    created_at: string;
    updated_at: string;
  };
}

export interface SwapQuotationResponse {
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
  user: {
    id: string;
    sn: string;
    email: string;
    reference: string | null;
    first_name: string;
    last_name: string;
    display_name: string;
    created_at: string;
    updated_at: string;
  };
}

export interface CreateSubAccountParams {
  email: string;
  first_name?: string;
  last_name?: string;
}

export class QuidaxClient {
  private baseUrl = 'https://www.quidax.com/api/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  static async post(endpoint: string, data: any) {
    const response = await fetch(`https://www.quidax.com/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`
      },
      body: JSON.stringify(data)
    });
    return response;
  }

  async fetchOrderBook(market: string) {
    const response = await fetch(`${this.baseUrl}/markets/${market}/order_book`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }

  async createSubAccount(data: { email: string; first_name?: string; last_name?: string }) {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async fetchUserWallets(userId: string) {
    const response = await fetch(`${this.baseUrl}/users/${userId}/wallets`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }

  async getTransactionStatus(reference: string) {
    const response = await fetch(`${this.baseUrl}/transactions/${reference}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    return response.json();
  }

  async getRate(base: string, quote: string) {
    const response = await fetch(`${this.baseUrl}/markets/${base}${quote}/ticker`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    const data = await response.json();
    return data?.data?.last_price || null;
  }

  async confirmSwapQuotation(data: { user_id: string; quotation_id: string }) {
    const response = await fetch(`${this.baseUrl}/swaps/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getNetworks(currency: string) {
    const response = await fetch(`${this.baseUrl}/currencies/${currency}/networks`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    const data = await response.json();
    return data.data || [];
  }

  async getDepositAddress(currency: string, network: string) {
    const response = await fetch(`${this.baseUrl}/wallets/${currency}/deposit_address?network=${network}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    const data = await response.json();
    return data.data || {};
  }
} 