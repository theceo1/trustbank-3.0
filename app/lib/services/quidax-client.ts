import { QUIDAX_CONFIG } from '../config/quidax';

interface QuidaxWallet {
  currency: string;
  balance: string;
  locked: string;
}

interface QuidaxUser {
  id: string;
  sn: string;
  email: string;
  first_name: string;
  last_name: string;
  reference?: string;
  created_at: string;
  updated_at: string;
}

interface QuidaxQuotation {
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

interface QuidaxSwap {
  id: string;
  from_currency: string;
  to_currency: string;
  from_amount: string;
  received_amount: string;
  execution_price: string;
  status: string;
  created_at: string;
  updated_at: string;
  swap_quotation: QuidaxQuotation;
  user: QuidaxUser;
}

interface QuidaxResponse<T> {
  status: string;
  message: string;
  data: T;
}

export class QuidaxClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = QUIDAX_CONFIG.apiUrl;
    this.apiKey = QUIDAX_CONFIG.apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<QuidaxResponse<T>> {
    console.log(`[QuidaxClient] Making request to ${endpoint}`);
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    console.log(`[QuidaxClient] Response from ${endpoint}:`, data);

    if (!response.ok) {
      throw new Error(data.message || 'Quidax API request failed');
    }

    return data;
  }

  async createSubAccount(userData: { email: string; first_name: string; last_name: string }): Promise<QuidaxResponse<QuidaxUser>> {
    console.log('[QuidaxClient] Creating sub-account for:', userData.email);
    return this.request<QuidaxUser>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async fetchUserDetails(userId: string = 'me'): Promise<QuidaxResponse<QuidaxUser>> {
    console.log('[QuidaxClient] Fetching user details for:', userId);
    return this.request<QuidaxUser>(`/users/${userId}`);
  }

  async fetchUserWallets(userId: string = 'me'): Promise<QuidaxResponse<QuidaxWallet[]>> {
    console.log('[QuidaxClient] Fetching wallets for user:', userId);
    return this.request<QuidaxWallet[]>(`/users/${userId}/wallets`);
  }

  async fetchWallet(userId: string = 'me', currency: string): Promise<QuidaxResponse<QuidaxWallet>> {
    console.log('[QuidaxClient] Fetching wallet for user:', userId, 'currency:', currency);
    return this.request<QuidaxWallet>(`/users/${userId}/wallets/${currency}`);
  }

  async getRate(market: string): Promise<QuidaxResponse<any>> {
    console.log('[QuidaxClient] Getting rate for market:', market);
    return this.request<any>(`/markets/tickers/${market}`);
  }

  async createSwapQuotation(userId: string = 'me', data: { 
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }): Promise<QuidaxResponse<QuidaxQuotation>> {
    console.log('[QuidaxClient] Creating swap quotation for user:', userId, 'data:', data);
    return this.request<QuidaxQuotation>(`/users/${userId}/swap_quotation`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmSwapQuotation(userId: string = 'me', quotationId: string): Promise<QuidaxResponse<QuidaxSwap>> {
    console.log('[QuidaxClient] Confirming swap quotation:', quotationId, 'for user:', userId);
    return this.request<QuidaxSwap>(`/users/${userId}/swap_quotation/${quotationId}/confirm`, {
      method: 'POST',
    });
  }

  async fetchMarketTicker(market: string): Promise<QuidaxResponse<any>> {
    console.log('[QuidaxClient] Fetching market ticker for:', market);
    return this.request<any>(`/markets/tickers/${market}`);
  }

  async getQuote(params: {
    market: string;
    unit: string;
    kind: 'ask' | 'bid';
    volume: string;
  }): Promise<QuidaxResponse<any>> {
    console.log('[QuidaxClient] Getting quote with params:', params);
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`/quotes?${queryString}`);
  }
} 