"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/hooks/use-user';
import { Button } from '@/components/ui/button';
import { TradePreview } from './TradePreview';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { QuidaxService } from '@/app/lib/services/quidax';
import { useToast } from '@/hooks/use-toast';
import { TradeDetails, TradeType, TradeRateResponse } from '@/app/types/trade';
import { UnifiedTradeService } from '@/app/lib/services/unified-trade';
import { useKYC } from '@/app/hooks/use-kyc';
import { handleError } from '@/app/lib/utils/errorHandler';
import { Copy, Send, Wallet, ArrowLeftRight } from 'lucide-react';
import { PaymentFlowController } from '@/app/trade/lib/paymentFlowController';
import { FeeService } from '@/app/lib/services/fees';
import { TradeTypeSelector } from './TradeTypeSelector';
import { SwapForm } from './SwapForm';
import { StandardTradeForm } from './StandardTradeForm';
import { PaymentMethodType } from '@/app/types/payment';

interface TradeFormProps {
  initialType?: TradeType;
}

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
      const rateData = await QuidaxService.getRate({
        amount: Number(tradeState.amount),
        currency_pair: `${tradeState.fromCurrency.toLowerCase()}_ngn`,
        type: tradeState.type
      });
      
      setTradeState(prev => ({
        ...prev,
        rate: rateData
      }));
    } catch (error) {
      console.error('Rate fetch error:', error);
      setTradeState(prev => ({ ...prev, rate: null }));
    }
  }, [tradeState.amount, tradeState.type, tradeState.fromCurrency]);

  useEffect(() => {
    fetchRate();
    const interval = setInterval(fetchRate, 30000);
    return () => clearInterval(interval);
  }, [fetchRate]);

  const handleTradeSubmit = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const isEligible = await checkKYCAndProceed();
      if (!isEligible) return;

      const fees = await FeeService.calculateFees({
        user_id: user.id,
        currency: tradeState.fromCurrency,
        amount: Number(tradeState.amount)
      });

      const tradeDetails = {
        user_id: user.id,
        type: tradeState.type,
        currency: tradeState.fromCurrency,
        amount: Number(tradeState.amount),
        rate: tradeState.rate!.rate,
        total: tradeState.rate!.total,
        fees,
        payment_method: tradeState.paymentMethod,
        status: 'pending'
      };

      setShowTradeDetails(true);
      setPendingTrade(tradeDetails as unknown as TradeDetails);
    } catch (error) {
      handleError(error, 'Failed to prepare trade');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTradeConfirm = async () => {
    if (!tradeState.pendingTrade) return;
    
    try {
      setIsLoading(true);
      const trade = await UnifiedTradeService.createTrade(tradeState.pendingTrade);
      const paymentFlow = await PaymentFlowController.initiate(trade);

      if (paymentFlow.type === 'external') {
        window.location.href = paymentFlow.redirect;
      } else {
        router.push(paymentFlow.redirect);
      }
    } catch (error) {
      handleError(error, 'Failed to process trade');
    } finally {
      setIsLoading(false);
      setShowTradeDetails(false);
    }
  };

  const checkKYCAndProceed = async (): Promise<boolean> => {
    const kycStatus = await checkKYCStatus();
    
    if (!kycStatus) {
      toast({
        id: "kyc-required",
        title: "KYC Required",
        description: "Please complete your KYC verification to proceed",
        variant: "destructive"
      });
      router.push('/kyc');
      return false;
    }
    
    return true;
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
    <div className="space-y-6">
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

      {tradeState.showPreview ? (
        <TradePreview
          tradeDetails={tradeState.pendingTrade!}
          onConfirm={handleTradeConfirm}
          onCancel={() => setTradeState(prev => ({ ...prev, showPreview: false }))}
          isLoading={tradeState.isLoading}
        />
      ) : (
        <Button
          onClick={handleTradeSubmit}
          disabled={!tradeState.rate || tradeState.isLoading}
          className="w-full"
        >
          Confirm Trade
        </Button>
      )}
    </div>
  );
}