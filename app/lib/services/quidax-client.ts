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
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey = process.env.QUIDAX_SECRET_KEY) {
    this.apiKey = apiKey || '';
    this.baseUrl = QUIDAX_API_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    console.log('Making request to:', url);
    console.log('Request options:', {
      ...options,
      headers: {
        ...headers,
        Authorization: 'Bearer [HIDDEN]'
      }
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('Request failed:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async getUser(): Promise<QuidaxUser> {
    const { data } = await this.request<{ data: QuidaxUser }>('/users/me');
    return data;
  }

  async createSubAccount(params: CreateSubAccountParams): Promise<QuidaxUser> {
    const { data } = await this.request<{ data: QuidaxUser }>('/users/sub_accounts', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return data;
  }

  async getDepositAddress(currency: string, userId: string, network?: string) {
    const { data } = await this.request<{
      data: {
        address: string;
        network: string;
        destination_tag?: string;
      }
    }>(`/users/${userId}/wallets/${currency.toLowerCase()}/address`, {
      method: 'POST',
      body: JSON.stringify({ network })
    });

    return {
      address: data.address,
      network: data.network,
      tag: data.destination_tag
    };
  }

  async fetchUserWallets(userId: string = 'me'): Promise<QuidaxWallet[]> {
    try {
      console.log('Fetching wallets for user:', userId);
      const { data } = await this.request<{ data: QuidaxWallet[] }>(
        `/users/${userId}/wallets`
      );
      return data;
    } catch (error) {
      console.error('Error fetching wallets:', error);
      throw error;
    }
  }

  async getWallet(currency: string, userId: string): Promise<QuidaxWallet> {
    const { data } = await this.request<{ data: QuidaxWallet }>(
      `/users/${userId}/wallets/${currency.toLowerCase()}`
    );
    return data;
  }

  async getRate(base: string, quote: string): Promise<string> {
    const { data } = await this.request<{ data: { ticker: { last: string } } }>(
      `/markets/tickers/${base.toLowerCase()}${quote.toLowerCase()}`
    );
    return data.ticker.last;
  }

  async transferCrypto(
    currency: string,
    amount: string,
    recipientId: string
  ): Promise<{ id: string; status: string }> {
    const { data } = await this.request<{ data: { id: string; status: string } }>('/transfers', {
      method: 'POST',
      body: JSON.stringify({
        currency: currency.toLowerCase(),
        amount,
        recipient_id: recipientId
      })
    });
    return data;
  }

  async getDepositHistory(currency?: string) {
    const endpoint = currency 
      ? `/users/deposits/${currency.toLowerCase()}`
      : '/users/deposits';
    
    const { data } = await this.request<{ data: any[] }>(endpoint);
    return data;
  }

  async getNetworks(currency: string) {
    const { data } = await this.request<{ data: any[] }>(`/markets/networks/${currency.toLowerCase()}`);
    return data;
  }

  async estimateDepositFee(currency: string, network: string) {
    const { data } = await this.request<{ data: any }>(`/markets/estimate_network_fee`, {
      method: 'POST',
      body: JSON.stringify({
        currency: currency.toLowerCase(),
        network
      })
    });
    return data;
  }

  async validateAddress(currency: string, address: string, network?: string) {
    const { data } = await this.request<{ data: { is_valid: boolean } }>(`/markets/validate_address`, {
      method: 'POST',
      body: JSON.stringify({
        currency: currency.toLowerCase(),
        address,
        network
      })
    });
    return data.is_valid;
  }

  async createSwapQuotation(params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
    user_id: string;
  }): Promise<SwapQuotationResponse> {
    const { user_id, ...rest } = params;
    const { data } = await this.request<{ data: SwapQuotationResponse }>(
      `/users/${user_id}/swap_quotation`,
      {
        method: 'POST',
        body: JSON.stringify(rest)
      }
    );
    return data;
  }

  async confirmSwapQuotation(params: {
    user_id: string;
    quotation_id: string;
  }): Promise<SwapResponse> {
    const { user_id, quotation_id } = params;
    const { data } = await this.request<{ status: string; message: string; data: SwapResponse }>(
      `/users/${user_id}/swap_quotation/${quotation_id}/confirm`,
      { method: 'POST' }
    );
    return data;
  }

  async refreshSwapQuotation(params: {
    user_id: string;
    quotation_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }): Promise<SwapQuotationResponse> {
    const { user_id, quotation_id, ...rest } = params;
    const { data } = await this.request<{ data: SwapQuotationResponse }>(
      `/users/${user_id}/swap_quotation/${quotation_id}/refresh`,
      {
        method: 'POST',
        body: JSON.stringify(rest)
      }
    );
    return data;
  }

  async getSwapTransaction(params: {
    user_id: string;
    swap_transaction_id: string;
  }): Promise<SwapResponse> {
    const { user_id, swap_transaction_id } = params;
    const { data } = await this.request<{ data: SwapResponse }>(
      `/users/${user_id}/swap_transactions/${swap_transaction_id}`
    );
    return data;
  }

  async getSwapTransactions(userId: string): Promise<SwapResponse[]> {
    const { data } = await this.request<{ data: SwapResponse[] }>(
      `/users/${userId}/swap_transactions`
    );
    return data;
  }

  async getTemporarySwapQuotation(params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
    user_id: string;
  }): Promise<SwapQuotationResponse> {
    const { user_id, ...rest } = params;
    const { data } = await this.request<{ data: SwapQuotationResponse }>(
      `/users/${user_id}/temporary_swap_quotation`,
      {
        method: 'POST',
        body: JSON.stringify(rest)
      }
    );
    return data;
  }
} 