"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TradeDetails, TradeType, TradeRateResponse, TradeParams } from '@/app/types/trade';
import { UnifiedTradeService } from '@/app/lib/services/unifiedTrade';
import { KYCService } from '@/app/lib/services/kyc';
import { TradeErrorHandler } from '@/app/lib/services/tradeErrorHandler';
import { PaymentMethodType } from '../types/payment';

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

  const fetchRate = useCallback(async (force = false) => {
    if (!tradeState.amount || Number(tradeState.amount) <= 0) {
      updateTradeState({ rate: null, rateExpiry: null });
      return;
    }

    if (!force && tradeState.rate && tradeState.rateExpiry && Date.now() < tradeState.rateExpiry - RATE_REFRESH_BUFFER) {
      return;
    }

    try {
      const response = await UnifiedTradeService.getRate({
        amount: Number(tradeState.amount),
        currency_pair: `${tradeState.cryptoCurrency}_usd`,
        type: tradeState.tradeType
      });

      updateTradeState({
        rate: response,
        rateExpiry: Date.now() + RATE_EXPIRY_TIME
      });
    } catch (error) {
      TradeErrorHandler.handleError(error, 'Rate fetch failed', toast);
    }
  }, [tradeState.amount, tradeState.cryptoCurrency, tradeState.tradeType, tradeState.rate, tradeState.rateExpiry, updateTradeState, toast]);

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
        router.push('/profile/kyc');
        return null;
      }

      const tradeDetails: TradeParams = {
        user_id: user.id,
        type: tradeState.tradeType,
        currency: tradeState.cryptoCurrency,
        amount: Number(tradeState.amount),
        rate: tradeState.rate.rate,
        total: tradeState.rate.total,
        fees: {
          service: tradeState.rate.fees.quidax + tradeState.rate.fees.platform,
          network: tradeState.rate.fees.processing
        },
        paymentMethod: tradeState.paymentMethod,
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