//scripts/services/test-quidax.ts

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables first
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Then check for required variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables for Supabase');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export class TestQuidaxService {
  private static baseUrl: string;
  private static secretKey: string;

  static {
    if (!process.env.QUIDAX_API_URL || !process.env.QUIDAX_SECRET_KEY) {
      throw new Error('Missing required environment variables for Quidax');
    }
    this.baseUrl = process.env.QUIDAX_API_URL;
    this.secretKey = process.env.QUIDAX_SECRET_KEY;
  }

  static async createSubAccount(userData: {
    email: string;
    first_name: string;
    last_name: string;
  }) {
    try {
      // First check if user exists
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: existingUser } = await supabase
        .from('users')
        .select('quidax_id')
        .eq('email', userData.email)
        .single();

      if (existingUser?.quidax_id) {
        return { id: existingUser.quidax_id };
      }

      const response = await axios.post(
        `${this.baseUrl}/users`,
        {
          identity: {
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name
          },
          type: 'sub_account'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Create Quidax sub-account error:', error);
      throw error;
    }
  }

  static async getTemporaryQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    try {
      console.log('Requesting quotation with params:', params);
      
      const response = await axios.post(
        `${this.baseUrl}/users/me/temporary_swap_quotation`,
        {
          from_currency: params.from_currency.toLowerCase(),
          to_currency: params.to_currency.toLowerCase(),
          from_amount: params.from_amount
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Quotation response:', response.data);
      return response.data.data;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        data: error.config?.data
      };
      console.error('Quidax temporary quotation error:', errorDetails);
      throw error;
    }
  }

  static async createSwapQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
    payment_method?: 'wallet' | 'card' | 'bank_transfer';
  }) {
    try {
      console.log('Creating swap quotation with params:', params);
      
      const response = await axios.post(
        `${this.baseUrl}/users/me/swap_quotation`,
        {
          from_currency: params.from_currency.toLowerCase(),
          to_currency: params.to_currency.toLowerCase(),
          from_amount: params.from_amount,
          type: 'instant',
          payment_method: params.payment_method || 'card'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Swap quotation response:', response.data);
      return response.data.data;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        data: error.config?.data
      };
      console.error('Quidax swap quotation error:', errorDetails);
      throw error;
    }
  }

  static async confirmSwapQuotation(params: {
    user_id: string;
    quotation_id: string;
    instant_order_id: string;
  }) {
    try {
      console.log('Confirming swap quotation with params:', params);
      
      const response = await axios.post(
        `${this.baseUrl}/users/me/swap_quotation/${params.quotation_id}/confirm`,
        {
          confirm: true,
          type: 'instant',
          instant_order_id: params.instant_order_id
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Swap confirmation response:', response.data);
      return response.data.data;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        data: error.config?.data
      };
      console.error('Quidax swap confirmation error:', errorDetails);
      throw error;
    }
  }

  static async verifyParentAccount() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Parent account details:', response.data);
      return response.data.data;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      };
      console.error('Failed to verify parent account:', errorDetails);
      throw error;
    }
  }

  static async getWalletBalance(currency: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/wallets/${currency.toLowerCase()}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Get wallet balance error:', error.response?.data || error);
      throw error;
    }
  }

  static async createInstantSwap(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
    payment_method: 'card' | 'bank_transfer' | 'wallet';
  }) {
    try {
      console.log('Creating instant swap with params:', params);
      
      // Simplified payload matching the successful request
      const response = await axios.post(
        `${this.baseUrl}/users/me/swap_quotation`,
        {
          from_currency: params.from_currency.toLowerCase(),
          to_currency: params.to_currency.toLowerCase(),
          from_amount: params.from_amount
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Instant swap creation response:', response.data);
      return response.data.data;
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        data: error.config?.data
      };
      console.error('Create instant swap error:', errorDetails);
      throw error;
    }
  }

  static async checkWalletBalance(userId: string, currency: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/${userId}/wallets/${currency}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to check wallet balance:', error);
      throw error;
    }
  }

  static async confirmInstantSwap(params: {
    user_id: string;
    quotation_id: string;
    payment_method: 'card' | 'bank_transfer' | 'wallet';
  }) {
    try {
      // First check wallet balance if using wallet payment
      if (params.payment_method === 'wallet') {
        const walletBalance = await this.checkWalletBalance(params.user_id, 'ngn');
        console.log('Current wallet balance:', walletBalance);
      }

      console.log('\nConfirming instant swap with params:', params);

      // Simplified payload based on API docs
      const payload = {
        payment_method: params.payment_method,
        confirm: true,
        terms_and_conditions: true
      };

      const response = await axios.post(
        `${this.baseUrl}/users/me/swap_quotation/${params.quotation_id}/confirm`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('\nConfirm instant swap complete error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  // Add helper methods for quotation management
  private static async getQuotation(userId: string, quotationId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/users/me/swap_quotation/${quotationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Get quotation error:', error.response?.data || error);
      throw error;
    }
  }

  private static async refreshQuotation(userId: string, quotationId: string, params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    const response = await axios.post(
      `${this.baseUrl}/users/${userId}/swap_quotation/${quotationId}/refresh`,
      {
        from_currency: params.from_currency.toLowerCase(),
        to_currency: params.to_currency.toLowerCase(),
        from_amount: params.from_amount
      },
      {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data;
  }

  static async generateDepositAddress(params: {
    user_id: string;
    currency: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${params.user_id}/wallets/${params.currency}/addresses`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Generate deposit address error:', error);
      throw error;
    }
  }

  static async initiateDeposit(params: {
    user_id: string;
    currency: string;
    amount: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${params.user_id}/deposits`,
        {
          currency: params.currency,
          amount: params.amount,
          payment_method: 'bank_transfer'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Initiate deposit error:', error);
      throw error;
    }
  }
}