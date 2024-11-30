// app/lib/services/unifiedTrade.ts
import { QuidaxService } from './quidax';
import { WalletService } from './wallet';
import { 
  TradeParams, 
  TradeDetails, 
  TradeStatus, 
  CreateTradeParams, 
  QuidaxTradeResponse, 
  QuidaxRateParams
} from '@/app/types/trade';
import { handleError } from '@/app/lib/utils/errorHandler';

export class UnifiedTradeService {
  static async createTrade(params: TradeParams): Promise<TradeDetails> {
    try {
      const quidaxParams: CreateTradeParams = {
        amount: params.amount,
        currency: `${params.currency.toLowerCase()}_ngn`,
        type: params.type,
        paymentMethod: params.paymentMethod,
        user_id: '',
        rate: 0,
        total: 0,
        fees: {
          service: 0,
          network: 0
        }
      };

      const quidaxTrade: QuidaxTradeResponse = await QuidaxService.createTrade(quidaxParams);
      
      const tradeDetails: TradeDetails = {
        id: quidaxTrade.id,
        status: this.mapQuidaxStatus(quidaxTrade.status),
        type: params.type,
        currency: params.currency,
        amount: params.amount,
        rate: params.rate,
        total: params.amount * params.rate,
        fees: {
          quidax: params.amount * 0.01,
          platform: 0,
          processing: 0.0005
        },
        payment_method: params.paymentMethod,
        reference: quidaxTrade.reference,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: params.user_id
      };

      return tradeDetails;
    } catch (error) {
      throw handleError(error, 'Failed to create trade');
    }
  }

  private static mapQuidaxStatus(status: string): TradeStatus {
    const statusMap: Record<string, TradeStatus> = {
      'pending': TradeStatus.PENDING,
      'processing': TradeStatus.PROCESSING,
      'completed': TradeStatus.COMPLETED,
      'failed': TradeStatus.FAILED
    };
    return statusMap[status.toLowerCase()] || TradeStatus.FAILED;
  }

  static async getTrade(tradeId: string): Promise<TradeDetails> {
    try {
      const trade = await QuidaxService.getTradeDetails(tradeId);
      return this.mapQuidaxTradeToTradeDetails(trade);
    } catch (error) {
      throw handleError(error, 'Failed to get trade details');
    }
  }

  static async getTradeStatus(tradeId: string): Promise<{ status: TradeStatus }> {
    try {
      const { status } = await QuidaxService.getTradeStatus(tradeId);
      return { status: status.toLowerCase() as TradeStatus };
    } catch (error) {
      throw handleError(error, 'Failed to get trade status');
    }
  }

  static async cancelTrade(tradeId: string): Promise<void> {
    try {
      const response = await fetch(`/api/trades/${tradeId}/cancel`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      throw new Error('Failed to cancel trade');
    }
  }

  static async getTradeHistory(userId: string): Promise<TradeDetails[]> {
    try {
      const response = await fetch('/api/trades/history');
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    } catch (error) {
      throw new Error('Failed to fetch trade history');
    }
  }

  static async validateTradeParams(params: TradeParams): Promise<boolean> {
    // Add validation logic here
    if (params.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!['buy', 'sell'].includes(params.type)) {
      throw new Error('Invalid trade type');
    }

    return true;
  }

  static async getRate(params: QuidaxRateParams) {
    try {
      const response = await fetch('/api/trade/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rate');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Rate fetch failed');
    }
  }

  private static mapQuidaxTradeToTradeDetails(quidaxTrade: any): TradeDetails {
    return {
      id: quidaxTrade.id,
      status: quidaxTrade.status.toLowerCase(),
      type: quidaxTrade.type,
      currency: quidaxTrade.currency,
      amount: parseFloat(quidaxTrade.amount),
      rate: parseFloat(quidaxTrade.rate),
      total: parseFloat(quidaxTrade.total),
      fees: {
        quidax: parseFloat(quidaxTrade.quidax_fee),
        platform: 0,
        processing: parseFloat(quidaxTrade.network_fee)
      },
      payment_method: quidaxTrade.payment_method,
      reference: quidaxTrade.reference,
      created_at: quidaxTrade.created_at,
      updated_at: quidaxTrade.updated_at,
      user_id: quidaxTrade.user_id
    };
  }

  static async validatePaymentMethod(method: string, amount: number) {
    const response = await fetch('/api/trades/validate-payment', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  static async updateTradeStatus(
    tradeId: string, 
    status: TradeStatus, 
    metadata?: any
  ): Promise<void> {
    try {
      const response = await fetch(`/api/trades/${tradeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, metadata })
      });

      if (!response.ok) {
        throw new Error('Failed to update trade status');
      }
    } catch (error) {
      throw handleError(error, 'Failed to update trade status');
    }
  }
}