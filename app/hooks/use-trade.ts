//app/hooks/use-trade.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TradeDetails, TradeType, TradeRateResponse, TradeParams } from '@/app/types/trade';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { KYCService } from '@/app/lib/services/kyc';
import { TradeErrorHandler } from '@/app/lib/services/tradeErrorHandler';
import { PaymentMethodType } from '../types/payment';
import { MarketRateService } from '@/app/lib/services/market-rate';

const RATE_EXPIRY_TIME = 30000; // 30 seconds
const RATE_REFRESH_BUFFER = 5000; // 5 seconds before expiry

export function useTrade() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [tradeState, setTradeState] = useState({
    amount: '',
    cryptoCurrency: 'btc',
    tradeType: 'buy' as TradeType,
    paymentMethod: 'bank_transfer' as PaymentMethodType,
    isLoading: false,
    rate: null as TradeRateResponse | null,
    rateExpiry: null as number | null,
    rateRefreshInterval: null as NodeJS.Timeout | null
  });

  const updateTradeState = useCallback((updates: Partial<typeof tradeState>) => {
    setTradeState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchRate = useCallback(async (silent = false) => {
    if (!tradeState.amount || !tradeState.cryptoCurrency || isNaN(Number(tradeState.amount))) {
      return;
    }

    try {
      if (!silent) {
        setTradeState(prev => ({ ...prev, isLoading: true }));
      }

      const params = new URLSearchParams({
        currency: tradeState.cryptoCurrency.toLowerCase(),
        amount: tradeState.amount.toString(),
        type: tradeState.tradeType
      });

      const response = await fetch(`/api/transactions/rate?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch rate');
      }

      const data = await response.json();
      
      if (!data || !data.rate) {
        throw new Error('Invalid rate response');
      }

      setTradeState(prev => ({
        ...prev,
        rate: data,
        rateExpiry: Date.now() + RATE_EXPIRY_TIME
      }));
    } catch (error) {
      console.error('Rate fetch error:', error);
      toast({
        id: `trade-rate-error-${Date.now()}`,
        title: "Error",
        description: "Failed to fetch rate. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTradeState(prev => ({ ...prev, isLoading: false }));
    }
  }, [tradeState.amount, tradeState.cryptoCurrency, tradeState.tradeType, toast]);

  // Auto-refresh rate management
  useEffect(() => {
    if (tradeState.rate && tradeState.rateExpiry) {
      const interval = setInterval(() => {
        const timeToExpiry = tradeState.rateExpiry! - Date.now();
        if (timeToExpiry <= RATE_REFRESH_BUFFER) {
          fetchRate(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tradeState.rate, tradeState.rateExpiry, fetchRate]);

  const createTrade = async (): Promise<TradeDetails | null> => {
    if (!user || !tradeState.rate) return null;

    try {
      setTradeState(prev => ({ ...prev, isLoading: true }));
      const { isVerified } = await KYCService.getKYCStatus(user.id);
      
      if (!isVerified) {
        router.push('/profile/verification');
        return null;
      }

      // Ensure trade type is 'buy' or 'sell'
      if (tradeState.tradeType !== 'buy' && tradeState.tradeType !== 'sell') {
        throw new Error('Invalid trade type. Only buy and sell trades are supported.');
      }
 
      const tradeDetails: TradeParams = {
        user_id: user.id,
        type: tradeState.tradeType as 'buy' | 'sell',
        currency: tradeState.cryptoCurrency,
        amount: Number(tradeState.amount),
        rate: tradeState.rate.rate,
        total: tradeState.rate.total,
        fees: {
          platform: tradeState.rate.fees.platform,
          processing: tradeState.rate.fees.processing,
          total: tradeState.rate.fees.total
        },
        payment_method: tradeState.paymentMethod,
        reference: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      return await UnifiedTradeService.createTrade(tradeDetails);
    } catch (error: any) {
      toast({
        id: `trade-error-${Date.now()}`,
        title: "Trade Failed",
        description: error.message || "Failed to create trade",
        variant: "destructive"
      });
      return null;
    } finally {
      setTradeState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    amount: tradeState.amount,
    setAmount: (amount: string) => updateTradeState({ amount }),
    cryptoCurrency: tradeState.cryptoCurrency,
    setCryptoCurrency: (cryptoCurrency: string) => updateTradeState({ cryptoCurrency }),
    tradeType: tradeState.tradeType,
    setTradeType: (tradeType: TradeType) => updateTradeState({ tradeType }),
    paymentMethod: tradeState.paymentMethod,
    setPaymentMethod: (paymentMethod: PaymentMethodType) => updateTradeState({ paymentMethod }),
    isLoading: tradeState.isLoading,
    rate: tradeState.rate,
    rateExpiry: tradeState.rateExpiry,
    fetchRate,
    createTrade
  };
}