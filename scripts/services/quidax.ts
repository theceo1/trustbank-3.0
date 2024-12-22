// scripts/services/quidax.ts

import axios from 'axios';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('trade:http');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate required environment variables
if (!process.env.QUIDAX_API_URL || !process.env.QUIDAX_SECRET_KEY) {
  throw new Error('Missing required Quidax environment variables');
}

export class QuidaxService {
  private static baseUrl = process.env.QUIDAX_API_URL;
  private static secretKey = process.env.QUIDAX_SECRET_KEY;

  static async getMarketStats(market: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/markets/tickers/${market}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get market stats error:', error.response?.data || error);
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
    } catch (error: any) {
      console.error('Check wallet balance error:', error.response?.data || error);
      throw error;
    }
  }

  static async createSwapQuotation(params: {
    user_id: string;
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${params.user_id}/swap_quotation`,
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
    } catch (error: any) {
      console.error('Create swap quotation error:', error.response?.data || error);
      throw error;
    }
  }

  static async confirmSwapQuotation(params: {
    user_id: string;
    quotation_id: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${params.user_id}/swap_quotation/${params.quotation_id}/confirm`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Confirm swap quotation error:', error.response?.data || error);
      throw error;
    }
  }

  static async getOrCreateSubAccount(params: {
    email: string;
    first_name: string;
    last_name: string;
  }) {
    try {
      // Check if the sub-account already exists
      const searchResponse = await axios.get(
        `${this.baseUrl}/users?email=${encodeURIComponent(params.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (searchResponse.data.data.length > 0) {
        return searchResponse.data.data[0];
      }

      // Create a new sub-account if it doesn't exist
      const response = await axios.post(
        `${this.baseUrl}/users`,
        {
          email: params.email,
          first_name: params.first_name,
          last_name: params.last_name
        },
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data;
    } catch (error: any) {
      console.error('Get or create sub-account error:', error.response?.data || error);
      throw error;
    }
  }

  static async createInstantSwap(userId: string, params: {
    from_currency: string;
    to_currency: string;
    from_amount: string;
  }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/users/${userId}/instant_swaps`,
        params,
        {
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Create instant swap error:', error);
      throw error;
    }
  }
} 