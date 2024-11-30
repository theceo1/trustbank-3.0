import { TradeDetails, TradeParams, TradeStatus } from '@/app/types/trade';
import { QuidaxService } from './quidax';

export class TradeService {
  static async getTradeStatus(tradeId: string): Promise<{ status: TradeStatus }> {
    try {
      const response = await fetch(`/api/trades/${tradeId}/status`);
      if (!response.ok) throw new Error('Failed to fetch trade status');
      return response.json();
    } catch (error) {
      throw new Error('Failed to get trade status');
    }
  }

  static async processPayment(tradeId: string, paymentMethod: string): Promise<void> {
    try {
      const response = await fetch(`/api/trades/${tradeId}/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      });
      
      if (!response.ok) throw new Error('Payment processing failed');
    } catch (error) {
      throw new Error('Failed to process payment');
    }
  }

  static async handlePaymentWebhook(payload: any): Promise<void> {
    const { reference, status, metadata } = payload;
    
    try {
      const trade = await this.getTradeByReference(reference);
      if (!trade) throw new Error('Trade not found');

      await this.updateTradeStatus(trade.id, status, metadata);
    } catch (error) {
      console.error('Webhook handler error:', error);
      throw error;
    }
  }

  private static async getTradeByReference(reference: string) {
    // Implementation depends on your database setup
    const response = await fetch(`/api/trades/by-reference/${reference}`);
    if (!response.ok) return null;
    return response.json();
  }

  private static async updateTradeStatus(tradeId: string, status: TradeStatus, metadata?: any) {
    const response = await fetch(`/api/trades/${tradeId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, metadata })
    });

    if (!response.ok) throw new Error('Failed to update trade status');
  }
}