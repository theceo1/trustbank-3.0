import axios from 'axios';

interface QuidaxResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface SwapQuotation {
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

interface QuidaxUser {
  id: string;
  sn: string;
  email: string;
  reference: string | null;
  first_name: string;
  last_name: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

interface SwapTransaction {
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
  user: QuidaxUser;
}

export class QuidaxService {
  private static baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
  private static apiKey = process.env.QUIDAX_SECRET_KEY;

  static async createSwapQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }): Promise<QuidaxResponse<SwapQuotation>> {
    const response = await axios.post(
      `${this.baseUrl}/users/${params.user_id}/swap_quotation`,
      {
        from_currency: params.from_currency.toLowerCase(),
        to_currency: params.to_currency.toLowerCase(),
        from_amount: params.from_amount
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  static async confirmSwap(userId: string, quotationId: string): Promise<QuidaxResponse<SwapTransaction>> {
    const response = await axios.post(
      `${this.baseUrl}/users/${userId}/swap_quotation/${quotationId}/confirm`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    return response.data;
  }

  static async getWalletBalance(userId: string, currency: string) {
    const response = await axios.get(
      `${this.baseUrl}/users/${userId}/wallets/${currency}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    return response.data;
  }

  static async transfer(fromUserId: string, toUserId: string, amount: string, currency: string) {
    const response = await axios.post(
      `${this.baseUrl}/withdraws`,
      {
        currency: currency.toLowerCase(),
        amount,
        fund_uid: toUserId,
        transaction_note: 'Internal transfer',
        narration: 'Fund transfer'
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    return {
      success: response.data.status === 'success',
      reference: response.data.data.id,
      status: response.data.data.status,
      ...response.data.data
    };
  }

  static async getTransactionStatus(transactionId: string) {
    const response = await axios.get(
      `${this.baseUrl}/transactions/${transactionId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    return {
      status: response.data.data.status,
      reference: transactionId
    };
  }
} 