// app/lib/services/quidax.ts
import { createHmac } from 'crypto';
import { QuidaxError } from '@/app/types/errors';
import { PaymentStatus } from '@/app/types/payment';
import { QuidaxWallet, QuidaxQuotation, QuidaxSwapTransaction } from '@/app/types/quidax';

export class QuidaxService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.QUIDAX_API_URL || 'https://www.quidax.com/api/v1';
    this.apiKey = process.env.QUIDAX_SECRET_KEY || '';
  }

  async getWallet(userId: string, currency: string) {
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/wallets/${currency}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch wallet: ${response.statusText}`);
    }

    return response.json();
  }
}