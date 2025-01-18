import { QUIDAX_CONFIG } from './config/quidax';

interface SwapQuotationResponse {
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
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface SwapResponse {
  id: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  received_amount: string;
  execution_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  swap_quotation: SwapQuotationResponse;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export class QuidaxClient {
  private apiUrl: string;
  public apiKey: string;

  constructor() {
    this.apiUrl = QUIDAX_CONFIG.apiUrl;
    this.apiKey = QUIDAX_CONFIG.apiKey;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'TrustBank/1.0',
      'X-Quidax-Version': 'v1',
      ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Quidax API error: ${error}`);
    }

    const data = await response.json();
    return data.data;
  }

  async createSubAccount(params: { email: string; firstName: string; lastName: string }) {
    return this.request<{ id: string }>('/users', {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName
      })
    });
  }

  async getWalletAddress(userId: string, currency: string) {
    const data = await this.request<{ address: string }>(
      `/users/${userId}/wallets/${currency}/address`
    );
    return data.address;
  }

  async getWalletBalance(userId: string, currency: string) {
    return this.request<{
      balance: string;
      currency: string;
    }>(`/users/${userId}/wallets/${currency}`);
  }

  async createSwapQuotation(userId: string, params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    return this.request<SwapQuotationResponse>(`/users/${userId}/swap_quotation`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async confirmSwap(userId: string, quotationId: string) {
    return this.request<SwapResponse>(`/users/${userId}/swap_quotation/${quotationId}/confirm`, {
      method: 'POST'
    });
  }

  async refreshSwapQuotation(userId: string, quotationId: string, params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    return this.request<SwapQuotationResponse>(`/users/${userId}/swap_quotation/${quotationId}/refresh`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  async getSwapTransaction(userId: string, swapTransactionId: string) {
    return this.request<SwapResponse>(`/users/${userId}/swap_transactions/${swapTransactionId}`);
  }

  async getSwapTransactions(userId: string) {
    return this.request<SwapResponse[]>(`/users/${userId}/swap_transactions`);
  }

  async getTemporarySwapQuotation(userId: string, params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    return this.request<SwapQuotationResponse>(`/users/${userId}/temporary_swap_quotation`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
} 