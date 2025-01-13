//app/trade/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import WalletOverview from '@/app/components/trade/WalletOverview';
import { TradeTypeSelector } from '@/app/trade/components/TradeTypeSelector';
import { MarketStats } from '@/app/trade/components/MarketStats';
import OrderBook from '@/app/trade/components/OrderBook';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { ArrowRight, Loader2, Shield, Clock, Info } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { toast } from "sonner";
import TradePreview from '@/app/trade/components/TradePreview';
import { TradeStatus, TradeDetails } from "@/app/types/trade";
import { PaymentMethodType } from "@/app/types/payment";
import TradeReceipt from '@/app/trade/components/TradeReceipt';

const SUPPORTED_CURRENCIES = [
  { value: 'usdt', label: 'USDT' },
  { value: 'btc', label: 'BTC' },
  { value: 'eth', label: 'ETH' },
  { value: 'usdc', label: 'USDC' },
  { value: 'sol', label: 'SOL' },
  { value: 'bnb', label: 'BNB' },
  { value: 'matic', label: 'MATIC' },
  { value: 'doge', label: 'DOGE' }
];

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [hasQuidaxId, setHasQuidaxId] = useState(false);
  const supabase = createClientComponentClient();
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [selectedToCurrency, setSelectedToCurrency] = useState('BTC');
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | 'swap' | 'send'>('swap');
  const [amount, setAmount] = useState('');
  const [quotation, setQuotation] = useState<any>(null);
  const [quotationTimer, setQuotationTimer] = useState(14);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showTradePreview, setShowTradePreview] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [confirmedTrade, setConfirmedTrade] = useState<TradeDetails | null>(null);

  useEffect(() => {
    const checkUserSetup = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Check user's verification status
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_verified, quidax_id')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return;
        }

        setIsVerified(profile?.is_verified || false);
        setHasQuidaxId(!!profile?.quidax_id);
      } catch (error) {
        console.error('Error checking user setup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSetup();
  }, [user, supabase]);

  const handleReviewTrade = async () => {
    if (!user) {
      toast.error('Please sign in to continue');
      return;
    }

    if (!hasQuidaxId) {
      toast.error('Your account is not properly set up for trading');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      setIsReviewing(true);
      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          from_currency: selectedCurrency.toLowerCase(),
          to_currency: selectedToCurrency.toLowerCase(),
          from_amount: amount
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get quote');
      }

      const result = await response.json();
      setQuotation(result.data);
      setShowTradePreview(true);
    } catch (error) {
      console.error('Trade quote error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to get quote');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleConfirmTrade = async () => {
    try {
      if (!quotation || !user?.id) {
        toast.error('Invalid trade data');
        return;
      }

      // Add a 2 second buffer to the expiry time
      const expiryTime = new Date(quotation.expires_at).getTime() + 2000;
      if (Date.now() > expiryTime) {
        toast.error('Quote has expired. Please get a new quote.');
        setShowTradePreview(false);
        setQuotation(null);
        return;
      }

      const amount = parseFloat(quotation.from_amount);
      const serviceFee = amount * 0.02; // 2% service fee
      const networkFee = amount * 0.01; // 1% network fee
      const totalFee = serviceFee + networkFee;

      const response = await fetch('/api/trades/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tradeId: quotation.id,
          userId: user.id,
          type: tradeType,
          currency: selectedCurrency,
          amount: amount,
          rate: parseFloat(quotation.quoted_price),
          fees: {
            platform: serviceFee,
            processing: networkFee,
            total: totalFee
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm trade');
      }

      const data = await response.json();
      setConfirmedTrade(data.data);
      setShowReceipt(true);
      toast.success('Trade confirmed successfully');
    } catch (error) {
      console.error('Trade confirmation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to confirm trade');
    } finally {
      setShowTradePreview(false);
      setQuotation(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-gray-600">
            Please <Link href="/auth/login" className="text-primary hover:text-primary/90 underline">sign in</Link> to access trading features
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isVerified) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-gray-600">
            To ensure a secure trading experience, please complete your identity verification.{' '}
            <Link href="/profile/verification" className="text-primary hover:text-primary/90 underline">
              Complete Verification
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Wallet Overview & Trade Form */}
        <div className="space-y-6">
          <WalletOverview />
          
          <Card className="bg-orange-100">
            <CardHeader>
              <CardTitle className="text-black">Quick Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TradeTypeSelector value={tradeType} onChange={setTradeType} />
              
              <div className="space-y-4">
                {tradeType === 'swap' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-black mb-2 block">From Currency</label>
                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                        <SelectTrigger className="h-12 bg-white dark:bg-white">
                          <SelectValue placeholder="Select currency" className="text-black" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-white">
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem 
                              key={currency.value} 
                              value={currency.value}
                              className="text-black hover:bg-green-50 dark:hover:bg-green-50"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-black">{currency.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black mb-2 block">To Currency</label>
                      <Select value={selectedToCurrency} onValueChange={setSelectedToCurrency}>
                        <SelectTrigger className="h-12 bg-white dark:bg-white">
                          <SelectValue placeholder="Select currency" className="text-black" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-white">
                          {SUPPORTED_CURRENCIES.filter(c => c.value !== selectedCurrency).map((currency) => (
                            <SelectItem 
                              key={currency.value} 
                              value={currency.value}
                              className="text-black hover:bg-green-50 dark:hover:bg-green-50"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-black">{currency.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : tradeType === 'send' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-black mb-2 block">Select Currency</label>
                      <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                        <SelectTrigger className="h-12 bg-white dark:bg-white">
                          <SelectValue placeholder="Select currency" className="text-black" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-black">{currency.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black mb-2 block">Recipient Address</label>
                      <Input
                        type="text"
                        placeholder={`Enter ${selectedCurrency} address`}
                        className="h-12 bg-white dark:bg-white text-black dark:text-black"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-black mb-2 block">Select Currency</label>
                    <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                      <SelectTrigger className="h-12 bg-white dark:bg-white">
                        <SelectValue placeholder="Select currency" className="text-black" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-black">{currency.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Amount</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 pl-12 bg-white dark:bg-white text-black dark:text-black text-right"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-primary">
                      {tradeType === 'buy' ? '₦' : selectedCurrency}
                    </div>
                  </div>
                  {amount && tradeType !== 'send' && (
                    <div className="text-sm text-black">
                      ≈ {tradeType === 'buy' 
                        ? `${(parseFloat(amount) / (quotation?.rate || 1)).toFixed(8)} ${selectedCurrency}`
                        : `₦${formatNumber(parseFloat(amount) * (quotation?.rate || 1))}`
                      }
                    </div>
                  )}
                </div>

                {quotation && tradeType === 'swap' && (
                  <div className="p-4 rounded-lg bg-white border-2 border-primary/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-black">Rate</span>
                      <span className="font-medium text-black">
                        1 {selectedCurrency} = {formatNumber(parseFloat(quotation.quoted_price))} {selectedToCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-black">You'll Receive</span>
                      <span className="font-medium text-black">
                        {formatNumber(parseFloat(quotation.to_amount))} {selectedToCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-black">Quote expires in</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(quotationTimer / 14) * 100} 
                          className="w-24 bg-green-100 dark:bg-green-100" 
                        />
                        <span className="text-sm font-medium text-black">{quotationTimer}s</span>
                      </div>
                    </div>
                    {(() => {
                      const amount = parseFloat(quotation.from_amount);
                      const serviceFee = amount * 0.02; // 2% service fee
                      const networkFee = amount * 0.01; // 1% network fee
                      const totalFee = serviceFee + networkFee;
                      
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Service Fee (2%)</span>
                            <span>{formatCurrency(serviceFee)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Network Fee (1%)</span>
                            <span>{formatCurrency(networkFee)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total Fee (3%)</span>
                            <span>{formatCurrency(totalFee)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <Button
                  className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-100 hover:text-black"
                  onClick={handleReviewTrade}
                  disabled={!amount || parseFloat(amount) <= 0 || isReviewing}
                >
                  {isReviewing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Getting Quote...
                    </span>
                  ) : quotation ? (
                    <span className="flex items-center gap-2">
                      Confirm {tradeType === 'buy' ? 'Purchase' : tradeType === 'sell' ? 'Sale' : tradeType === 'swap' ? 'Swap' : 'Send'}
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {tradeType === 'send' ? 'Send' : 'Get Quote'}
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>

                {/* Trade Tips */}
                <div className="text-sm text-black space-y-2 mt-4 p-4 rounded-lg bg-white">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Secure transactions with bank-grade encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Processing time: 5-15 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span>24/7 customer support available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Column - Market Stats & Order Book */}
        <div className="lg:col-span-2 space-y-6">
          <MarketStats />
          <Card>
            <CardHeader>
              <CardTitle>Order Book</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderBook market={`${selectedCurrency.toLowerCase()}ngn`} />
            </CardContent>
          </Card>
        </div>
      </div>

      {showTradePreview && quotation && (
        <TradePreview
          tradeDetails={{
            type: tradeType,
            currency: selectedCurrency,
            amount: parseFloat(quotation.from_amount),
            rate: parseFloat(quotation.quoted_price),
            total: parseFloat(quotation.from_amount),
            fees: {
              platform: parseFloat(quotation.from_amount) * 0.02, // Service fee (2%)
              processing: parseFloat(quotation.from_amount) * 0.01, // Network fee (1%)
              total: parseFloat(quotation.from_amount) * 0.03 // Total fee (3%)
            },
            user_id: user?.id || '',
            payment_method: 'crypto' as PaymentMethodType,
            status: TradeStatus.PENDING
          }}
          onConfirm={handleConfirmTrade}
          onCancel={() => setShowTradePreview(false)}
          onRefreshQuote={handleReviewTrade}
          isLoading={isReviewing}
          isOpen={showTradePreview}
          expiryTime={Date.now() + quotationTimer * 1000}
        />
      )}

      {showReceipt && confirmedTrade && (
        <TradeReceipt
          isOpen={showReceipt}
          onClose={() => setShowReceipt(false)}
          trade={confirmedTrade}
        />
      )}
    </div>
  );
}