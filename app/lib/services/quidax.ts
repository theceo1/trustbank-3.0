import { QUIDAX_CONFIG } from '../config/quidax';
import { createHmac } from 'crypto';

export interface QuidaxWebhookEvent {
  id: string;
  event: string;
  data: any;
}

export interface CreateSubAccountParams {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
}

export interface QuidaxUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
}

export interface WalletBalance {
  id: string;
  name: string;
  currency: string;
  balance: string;
  locked: string;
  staked: string;
  converted_balance: string;
  reference_currency: string;
  is_crypto: boolean;
  blockchain_enabled: boolean;
  default_network: string | null;
  address?: string;
  networks: {
    id: string;
    name: string;
    deposits_enabled: boolean;
    withdraws_enabled: boolean;
  }[];
}

export interface QuidaxWallet {
  currency: string;
  balance: string;
  address?: string;
  tag?: string;
}

export interface QuidaxTransfer {
  id: string;
  status: string;
  amount: string;
  currency: string;
  from_user_id: string;
  to_user_id: string;
}

export class QuidaxService {
  private static readonly baseUrl = QUIDAX_CONFIG.apiUrl;
  private static apiKey = QUIDAX_CONFIG.apiKey;
  private static readonly webhookSecret = QUIDAX_CONFIG.webhookSecret;

  static setApiKey(key: string) {
    QuidaxService.apiKey = key;
  }

  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!QuidaxService.apiKey) {
      throw new Error('Quidax API key not configured');
    }

    const response = await fetch(`${QuidaxService.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${QuidaxService.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TrustBank/1.0',
        'X-Quidax-Version': 'v1',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    const data = await response.json();
    return data.data;
  }

  static async createSubAccount(params: CreateSubAccountParams): Promise<QuidaxUser> {
    try {
      const requestBody = {
        email: params.email,
        first_name: params.first_name,
        last_name: params.last_name,
        ...(params.phone ? { phone: params.phone } : {}),
        ...(params.country ? { country: params.country } : {})
      };

      const response = await QuidaxService.makeRequest<QuidaxUser>('/users', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      return response;
    } catch (error) {
      console.error('Error creating Quidax sub-account:', error);
      throw error;
    }
  }

  static async getSubAccount(userId: string): Promise<QuidaxUser> {
    try {
      return await QuidaxService.makeRequest<QuidaxUser>(`/users/${userId}`);
    } catch (error) {
      console.error('Error fetching Quidax sub-account:', error);
      throw error;
    }
  }

  static async getWalletBalance(userId: string, currency: string): Promise<{ balance: string }> {
    try {
      return await QuidaxService.makeRequest<{ balance: string }>(
        `/users/${userId}/wallets/${currency.toLowerCase()}`
      );
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  static async fetchWalletAddress(userId: string, currency: string): Promise<{ address: string; tag?: string }> {
    try {
      const response = await QuidaxService.makeRequest<{ address: string; tag?: string }>(
        `/users/${userId}/wallets/${currency.toLowerCase()}/address`
      );
      return response;
    } catch (error) {
      console.error('Error fetching wallet address:', error);
      throw error;
    }
  }

  static async createWalletAddress(userId: string, currency: string): Promise<{ address: string; tag?: string }> {
    try {
      return await QuidaxService.makeRequest<{ address: string; tag?: string }>(
        `/users/${userId}/wallets/${currency.toLowerCase()}/address`,
        {
          method: 'POST'
        }
      );
    } catch (error) {
      console.error('Error creating wallet address:', error);
      throw error;
    }
  }

  static async transfer(
    fromUserId: string,
    toUserId: string,
    amount: string,
    currency: string
  ): Promise<QuidaxTransfer> {
    try {
      return await QuidaxService.makeRequest<QuidaxTransfer>(`/users/${fromUserId}/withdraws`, {
        method: 'POST',
        body: JSON.stringify({
          currency: currency.toLowerCase(),
          amount,
          fund_uid: toUserId,
          transaction_note: 'Internal transfer',
          narration: 'Fund transfer'
        })
      });
    } catch (error) {
      console.error('Error performing transfer:', error);
      throw error;
    }
  }

  static async getTransactionStatus(transactionId: string): Promise<{ status: string }> {
    try {
      return await QuidaxService.makeRequest<{ status: string }>(`/transactions/${transactionId}`);
    } catch (error) {
      console.error('Error fetching transaction status:', error);
      throw error;
    }
  }

  static verifyWebhookSignature(webhook: QuidaxWebhookEvent, signature?: string): boolean {
    if (!QuidaxService.webhookSecret || !signature) {
      return false;
    }

    const hmac = createHmac('sha256', QuidaxService.webhookSecret);
    const calculatedSignature = hmac
      .update(JSON.stringify(webhook))
      .digest('hex');

    return signature === calculatedSignature;
  }

  static mapQuidaxStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'done': 'completed',
      'cancelled': 'failed',
      'failed': 'failed',
      'pending': 'pending',
      'processing': 'processing'
    };
    return statusMap[status.toLowerCase()] || 'pending';
  }

  static async fetchWalletBalances(userId: string): Promise<WalletBalance[]> {
    try {
      const response = await QuidaxService.makeRequest<WalletBalance[]>(
        `/users/${userId}/wallets`
      );
      return response;
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      throw error;
    }
  }
} 