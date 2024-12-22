import { MarketStats } from '@/app/types/market';

const QUIDAX_API = 'https://www.quidax.com/api/v1';

export class QuidaxMarketService {
  static async getMarketTicker(market: string = 'btcngn') {
    try {
      const response = await fetch(`${QUIDAX_API}/markets/tickers/${market}`, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market ticker');
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market ticker:', error);
      throw error;
    }
  }

  static async getQuote(params: {
    market: string;
    unit: string;
    kind: 'ask' | 'bid';
    volume: string;
  }) {
    try {
      const queryString = new URLSearchParams({
        market: params.market,
        unit: params.unit,
        kind: params.kind,
        volume: params.volume
      }).toString();

      const response = await fetch(`${QUIDAX_API}/quotes?${queryString}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Quote fetch failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }
  }

  static async getAllMarketTickers() {
    try {
      const response = await fetch(`${QUIDAX_API}/markets/tickers`, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market tickers');
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching market tickers:', error);
      throw error;
    }
  }

  static async confirmQuote(userId: string, quotationId: string) {
    try {
      const response = await fetch(
        `${QUIDAX_API}/users/${userId}/swap_quotation/${quotationId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Swap confirmation failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error confirming swap:', error);
      throw error;
    }
  }

  static async createSwapQuote(params: {
    userId: string;
    fromCurrency: string;
    toCurrency: string;
    fromAmount: string;
  }) {
    try {
      const response = await fetch(
        `${QUIDAX_API}/users/${params.userId}/swap_quotation`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from_currency: params.fromCurrency.toLowerCase(),
            to_currency: params.toCurrency.toLowerCase(),
            from_amount: params.fromAmount,
            type: 'instant'
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Create swap quote failed: ${response.status} - ${errorData.message || response.statusText}`);
      }

      const { data } = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating swap quote:', error);
      throw error;
    }
  }
} 