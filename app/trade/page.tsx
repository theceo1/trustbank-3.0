//app/trade/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Skeleton } from '@/app/components/ui/skeleton';
import WalletOverview from '@/app/components/trade/WalletOverview';
import { TradeTypeSelector } from '@/app/trade/components/TradeTypeSelector';
import { MarketStats } from '@/app/trade/components/MarketStats';
import { OrderBook } from '@/app/trade/components/OrderBook';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { TradeQuotation } from "@/app/types/trade";
import { useToast } from "@/components/ui/use-toast";
import { TradeErrorHandler } from "@/app/lib/services/tradeErrorHandler";
import { type ToastProps } from '@/app/components/ui/toast';

interface UserProfile {
  kyc_status: string;
  tier1_verified: boolean;
}

const SUPPORTED_CURRENCIES = [
  { value: 'USDT', label: 'USDT' },
  { value: 'BTC', label: 'BTC' },
  { value: 'ETH', label: 'ETH' },
  { value: 'USDC', label: 'USDC' }
];

interface QuoteResponse {
  data: TradeQuotation;
}

export default function TradePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const supabase = createClientComponentClient();
  const [selectedCurrency, setSelectedCurrency] = useState('USDT');
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | 'swap' | 'send'>('buy');
  const [amount, setAmount] = useState('');
  const [quotation, setQuotation] = useState<TradeQuotation | null>(null);
  const [quotationTimer, setQuotationTimer] = useState(14);
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkVerification = async () => {
      try {
        setIsLoading(true);
        if (!user?.id) return;

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('kyc_status, tier1_verified')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        // User is verified if they have completed at least Tier 1
        const verified = profile?.tier1_verified === true;
        setIsVerified(verified);

        if (!verified) {
          toast(
            <div>
              To ensure a secure trading experience, please complete your identity verification.{' '}
              <Link href="/profile/verification" className="text-green-600 hover:text-green-700 underline">
                Complete Verification
              </Link>
            </div>
          );
        }
      } catch (error) {
        console.error('Verification check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerification();
  }, [user, supabase]);

  const handleReviewTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsReviewing(true);
      const response = await fetch('/api/trades/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: selectedCurrency,
          amount: parseFloat(amount),
          type: tradeType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get quote');
      }

      const { data } = await response.json() as { data: TradeQuotation };
      setQuotation(data);
      setQuotationTimer(14);

      // Start countdown
      const timer = setInterval(() => {
        setQuotationTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setQuotation(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReviewing(false);
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
            Please <Link href="/auth/login" className="text-green-600 hover:text-green-700 underline">sign in</Link> to access TrustBank trading features
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
            <Link href="/profile/verification" className="text-green-600 hover:text-green-700 underline">
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
          <Card>
            <CardHeader>
              <CardTitle>Quick Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TradeTypeSelector value={tradeType} onChange={setTradeType} />
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Currency</label>
                  <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-12 pl-12 text-lg"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      {selectedCurrency}
                    </span>
                  </div>
                </div>

                {quotation && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rate</span>
                      <span className="text-lg font-semibold text-green-600">{formatCurrency(quotation.rate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">You'll {tradeType}</span>
                      <span className="text-lg font-semibold">{formatNumber(quotation.amount)} {selectedCurrency}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rate expires in</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(quotationTimer / 14) * 100} className="w-24" />
                        <span className="text-sm font-medium">{quotationTimer}s</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-medium"
                  onClick={handleReviewTrade}
                  disabled={!amount || parseFloat(amount) <= 0 || isReviewing}
                >
                  {isReviewing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Getting Quote...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {tradeType === 'buy' ? 'Buy' : tradeType === 'sell' ? 'Sell' : tradeType === 'swap' ? 'Swap' : 'Send'} {selectedCurrency}
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Market Stats & Order Book */}
        <div className="space-y-6 lg:col-span-2">
          <MarketStats />
          <Card>
            <CardHeader>
              <CardTitle>Order Book</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderBook currency={selectedCurrency.toLowerCase()} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}