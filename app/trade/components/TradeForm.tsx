// app/trade/components/TradeForm.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/hooks/use-user';
import { useKYC } from '@/app/hooks/use-kyc';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { TradePreview } from './TradePreview';
import { SwapForm } from './SwapForm';
import { StandardTradeForm } from './StandardTradeForm';
import { TradeTypeSelector } from './TradeTypeSelector';
import { TradeDetails, TradeType, TradeRateResponse } from '@/app/types/trade';
import { PaymentMethodType } from '@/app/types/payment';
import { MarketRateService } from '@/app/lib/services/market-rate';
import { UnifiedTradeService } from '@/app/lib/services/unified-trade';
import { KYCService } from '@/app/lib/services/kyc';
import { FeeService } from '@/app/lib/services/fees';
import { handleError } from '@/app/lib/utils/errorHandler';

interface TradeFormProps {
  initialType?: TradeType;
}

const RATE_EXPIRY_TIME = 30000; // 30 seconds
const RATE_REFRESH_BUFFER = 5000; // 5 seconds before expiry

export function TradeForm({ initialType = 'buy' }: TradeFormProps) {
  const { user } = useUser();
  const { checkKYCStatus } = useKYC();
  const router = useRouter();
  const { toast } = useToast();
  
  const [tradeState, setTradeState] = useState({
    type: initialType,
    fromCurrency: 'btc',
    toCurrency: 'eth',
    amount: '',
    paymentMethod: 'bank_transfer' as PaymentMethodType,
    isLoading: false,
    rate: null as TradeRateResponse | null,
    showPreview: false,
    pendingTrade: null as TradeDetails | null
  });

  const setIsLoading = (loading: boolean) => {
    setTradeState(prev => ({ ...prev, isLoading: loading }));
  };

  const setShowTradeDetails = (show: boolean) => {
    setTradeState(prev => ({ ...prev, showPreview: show }));
  };

  const setPendingTrade = (trade: TradeDetails | null) => {
    setTradeState(prev => ({ ...prev, pendingTrade: trade }));
  };

  const handleTradeTypeChange = (type: TradeType) => {
    setTradeState(prev => ({
      ...prev,
      type,
      rate: null,
      showPreview: false
    }));
  };

  const fetchRate = useCallback(async () => {
    if (!tradeState.amount || Number(tradeState.amount) <= 0) {
      setTradeState(prev => ({ ...prev, rate: null }));
      return;
    }
    
    try {
      setIsLoading(true);
      const rate = await MarketRateService.getRate({
        amount: Number(tradeState.amount),
        currency_pair: `${tradeState.fromCurrency.toLowerCase()}_ngn`,
        type: tradeState.type as 'buy' | 'sell'
      });
      
      setTradeState(prev => ({
        ...prev,
        rate,
        rateExpiry: Date.now() + RATE_EXPIRY_TIME
      }));
    } catch (error) {
      handleError(error, 'Failed to fetch rate');
    } finally {
      setIsLoading(false);
    }
  }, [tradeState.amount, tradeState.type, tradeState.fromCurrency]);

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 30000);
    return () => clearInterval(interval);
  }, [fetchRate]);

  const handleTradeSubmit = async () => {
    try {
      setIsLoading(true);
      const kycStatus = await checkKYCStatus();
      
      if (!kycStatus) {
        toast({
          id: "kyc-required",
          title: "KYC Verification Required",
          description: "Please complete your identity verification to trade this amount",
          variant: "destructive"
        });
        
        // Short delay before redirect to ensure toast is visible
        setTimeout(() => {
          router.push('/profile/verification');
        }, 1500);
        return;
      }

      // Check KYC eligibility
      const eligibility = await KYCService.isEligibleForTrade(user!.id);

      if (!eligibility.eligible) {
        toast({
          id: "kyc-tier-limit",
          title: "Trade Not Allowed",
          description: eligibility.reason || "Please upgrade your KYC tier to proceed with this trade",
          variant: "destructive"
        });
        
        setTimeout(() => {
          router.push('/verification/upgrade');
        }, 1500);
        return;
      }

      const fees = await FeeService.calculateFees({
        user_id: user!.id,
        currency: tradeState.fromCurrency,
        amount: Number(tradeState.amount)
      });

      const tradeDetails = createTradeDetails();
      
      setTradeState(prev => ({
        ...prev,
        showPreview: true,
        pendingTrade: tradeDetails
      }));
    } catch (error) {
      handleError(error, 'Failed to prepare trade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTradeConfirm = async () => {
    try {
      setIsLoading(true);
      
      const trade = await UnifiedTradeService.createTrade(tradeState.pendingTrade!);
      
      if (trade) {
        toast({
          id: "trade-initiated",
          title: "Trade Initiated",
          description: "Proceeding to payment"
        });
        router.push(`/trade/payment/${trade.id}`);
      }
    } catch (error) {
      toast({
        id: "trade-failed",
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Failed to create trade",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SUPPORTED_CURRENCIES = [
    { value: 'btc', label: 'Bitcoin (BTC)' },
    { value: 'eth', label: 'Ethereum (ETH)' },
    { value: 'usdt', label: 'Tether (USDT)' },
    { value: 'usdc', label: 'USD Coin (USDC)' }
  ];

  const PAYMENT_METHODS = {
    buy: ['bank', 'card', 'wallet'],
    sell: ['bank'],
    swap: ['wallet'],
    send: ['wallet'],
    receive: ['wallet']
  };

  const createTradeDetails = (): TradeDetails => {
    if (!user || !tradeState.rate) throw new Error('Invalid trade state');
    
    return {
      user_id: user.id,
      type: tradeState.type,
      currency: tradeState.fromCurrency,
      amount: Number(tradeState.amount),
      rate: tradeState.rate.rate,
      total: tradeState.rate.total,
      fees: {
        quidax: tradeState.rate.fees.quidax,
        platform: tradeState.rate.fees.platform,
        processing: tradeState.rate.fees.processing
      },
      payment_method: tradeState.paymentMethod,
      status: 'pending'
    };
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl">
      <div className="space-y-2">
        {/* <h2 className="text-2xl font-bold tracking-tight">Trade Crypto</h2> */}
        <p className="text-sm text-muted-foreground">
          Buy, sell, swap or send cryptocurrency instantly
        </p>
      </div>

      <TradeTypeSelector 
        value={tradeState.type} 
        onChange={handleTradeTypeChange} 
      />
      
      {tradeState.type === 'swap' ? (
        <SwapForm
          fromCurrency={tradeState.fromCurrency}
          toCurrency={tradeState.toCurrency}
          amount={tradeState.amount}
          rate={tradeState.rate}
          onFromCurrencyChange={(currency) => setTradeState(prev => ({ ...prev, fromCurrency: currency }))}
          onToCurrencyChange={(currency) => setTradeState(prev => ({ ...prev, toCurrency: currency }))}
          onAmountChange={(amount) => setTradeState(prev => ({ ...prev, amount }))}
        />
      ) : (
        <StandardTradeForm
          type={tradeState.type}
          currency={tradeState.fromCurrency}
          amount={tradeState.amount}
          rate={tradeState.rate}
          onCurrencyChange={(currency) => setTradeState(prev => ({ ...prev, fromCurrency: currency }))}
          onAmountChange={(amount) => setTradeState(prev => ({ ...prev, amount }))}
        />
      )}

      <Button
        onClick={handleTradeSubmit}
        disabled={!tradeState.rate || tradeState.isLoading}
        className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500"
      >
        {tradeState.isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Review Trade
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>

      {tradeState.showPreview && tradeState.pendingTrade && (
        <TradePreview
          tradeDetails={tradeState.pendingTrade}
          onConfirm={handleTradeConfirm}
          onCancel={() => setTradeState(prev => ({ ...prev, showPreview: false }))}
          isLoading={tradeState.isLoading}
          isOpen={tradeState.showPreview}
        />
      )}
    </div>
  );
}