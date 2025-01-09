import axios from 'axios';

export class TestQuidaxService {
  static async checkWalletBalance(userId: string, currency: string) {
    // Implementation for checking wallet balance
    const response = await axios.get(`${process.env.NEXT_PUBLIC_QUIDAX_API_URL}/wallets/${currency}`, {
      headers: {
        Authorization: `Bearer ${process.env.QUIDAX_SECRET_KEY}`
      }
    });
    return response.data.data;
  }

  static async fundWallet(userId: string, currency: string, amount: string) {
    // Implementation for funding wallet
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_QUIDAX_API_URL}/wallets/${currency}/fund`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${process.env.QUIDAX_SECRET_KEY}`
        }
      }
    );
    return response.data.data;
  }

  static async getMarketStats(market: string) {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_QUIDAX_API_URL}/markets/${market}/stats`,
      {
        headers: {
          Authorization: `Bearer ${process.env.QUIDAX_SECRET_KEY}`
        }
      }
    );
    return response.data.data;
  }

  static async getTemporaryQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_QUIDAX_API_URL}/instant_orders/quote`,
      params,
      {
        headers: {
          Authorization: `Bearer ${process.env.QUIDAX_SECRET_KEY}`
        }
      }
    );
    return response.data.data;
  }

  static async createSwapQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_QUIDAX_API_URL}/instant_orders`,
      params,
      {
        headers: {
          Authorization: `Bearer ${process.env.QUIDAX_SECRET_KEY}`
        }
      }
    );
    return response.data.data;
  }

  static async confirmSwapQuotation(params: {
    user_id: string;
    quotation_id: string;
  }) {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_QUIDAX_API_URL}/instant_orders/${params.quotation_id}/confirm`,
      { user_id: params.user_id },
      {
        headers: {
          Authorization: `Bearer ${process.env.QUIDAX_SECRET_KEY}`
        }
      }
    );
    return response.data.data;
  }
} 