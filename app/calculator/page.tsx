"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Calculator as CalculatorIcon, RefreshCw } from 'lucide-react';

interface MarketTicker {
  buy: string;
  sell: string;
  low: string;
  high: string;
  open: string;
  last: string;
  vol: string;
}

interface CompetitorRate {
  name: string;
  rate: number;
}

const formatNumber = (value: number, currency: string) => {
  const formatter = new Intl.NumberFormat('en-NG', {
    style: currency === 'NGN' ? 'currency' : 'decimal',
    currency: 'NGN',
    minimumFractionDigits: currency === 'BTC' ? 8 : 2,
    maximumFractionDigits: currency === 'BTC' ? 8 : 2,
  });
  return formatter.format(value).replace('NGN', '₦');
};

export default function CalculatorPage() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('NGN');
  const [toCurrency, setToCurrency] = useState('USDT');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [marketTickers, setMarketTickers] = useState<Record<string, MarketTicker>>({});
  const [competitorRates, setCompetitorRates] = useState<CompetitorRate[]>([
    { name: 'trustBank', rate: 0 },
    { name: 'Exchange A', rate: 0 },
    { name: 'Exchange B', rate: 0 },
    { name: 'Exchange C', rate: 0 }
  ]);

  const currencies = [
    { value: 'NGN', label: 'Nigerian Naira (NGN)' },
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'USDT', label: 'Tether (USDT)' },
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' }
  ];

  useEffect(() => {
    fetchMarketTickers();
    const interval = setInterval(fetchMarketTickers, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketTickers = async () => {
    try {
      const response = await fetch('/api/market/tickers');
      if (!response.ok) throw new Error('Failed to fetch market rates');
      
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        setMarketTickers(data.data);
        
        // Update competitor rates based on USDT/NGN market
        const usdtngn = data.data.usdtngn;
        if (usdtngn && usdtngn.ticker && usdtngn.ticker.last) {
          const marketRate = parseFloat(usdtngn.ticker.last);
          if (!isNaN(marketRate) && marketRate > 0) {
            const trustBankRate = marketRate * 1.005; // trustBank offers 0.5% better rate
            setCompetitorRates([
              { name: 'trustBank', rate: trustBankRate },
              { name: 'Exchange A', rate: marketRate },
              { name: 'Exchange B', rate: marketRate * 0.995 },
              { name: 'Exchange C', rate: marketRate * 0.99 }
            ]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching market tickers:', error);
    }
  };

  const getQuote = async (fromCurrency: string, toCurrency: string, amount: string) => {
    try {
      const response = await fetch(
        `/api/market/quotes?from_currency=${fromCurrency}&to_currency=${toCurrency}&volume=${amount}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quote');
      }
      
      if (data.status === 'success' && data.data && data.data.price && data.data.price.amount) {
        const rate = parseFloat(data.data.price.amount);
        if (isNaN(rate) || rate <= 0) {
          throw new Error('Invalid rate received from server');
        }

        // Update competitor rates when we get a new quote
        if ((fromCurrency === 'NGN' && toCurrency === 'USDT') || (fromCurrency === 'USDT' && toCurrency === 'NGN')) {
          const baseRate = fromCurrency === 'NGN' ? 1 / rate : rate;
          const trustBankRate = baseRate * 1.005; // trustBank offers 0.5% better rate
          setCompetitorRates([
            { name: 'trustBank', rate: trustBankRate },
            { name: 'Exchange A', rate: baseRate },
            { name: 'Exchange B', rate: baseRate * 0.995 },
            { name: 'Exchange C', rate: baseRate * 0.99 }
          ]);
        }

        return rate;
      }
      
      console.error('Invalid quote data structure:', data);
      throw new Error('Invalid quote data received from server');
    } catch (error) {
      console.error('Error getting quote:', error);
      throw error;
    }
  };

  const calculateRate = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const numericAmount = parseFloat(amount);
      let calculatedResult: number;

      if (fromCurrency === toCurrency) {
        calculatedResult = numericAmount;
      } else {
        const rate = await getQuote(fromCurrency, toCurrency, amount);
        calculatedResult = numericAmount * rate;
        
        if (isNaN(calculatedResult) || calculatedResult <= 0) {
          throw new Error('Invalid calculation result');
        }
      }

      setResult(calculatedResult);
    } catch (error) {
      console.error('Calculation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate rate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-12 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
              Crypto Calculator
            </h1>
            <p className="text-muted-foreground mt-2">
              Get real-time conversion rates for cryptocurrencies and fiat currencies
            </p>
          </div>

          <div className="text-left mb-2 flex items-center gap-2">
            <h2 className="text-lg font-semibold">trust<span className="text-green-600">Rate™</span></h2>
            <span className="px-2.5 py-0.5 text-[6px] font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full uppercase tracking-wider">
              Beta
            </span>
          </div>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm dark:bg-black/50">
            <CardContent className="p-6">
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg h-12"
                  />
                  <div className="absolute right-3 top-3 text-sm text-muted-foreground">
                    {fromCurrency}
                  </div>
                </div>

                <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  <Select value={fromCurrency} onValueChange={setFromCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowRight className="w-6 h-6 text-green-600" />
                  </motion.div>

                  <Select value={toCurrency} onValueChange={setToCurrency}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={calculateRate}
                  disabled={loading}
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CalculatorIcon className="w-5 h-5 mr-2" />
                      Calculate Rate
                    </>
                  )}
                </Button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {result !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                      <div className="text-2xl font-semibold text-green-900 dark:text-green-100">
                        {formatNumber(parseFloat(amount), fromCurrency)} {fromCurrency} = 
                      </div>
                      <div className="text-3xl font-bold text-green-600 mt-2">
                        {formatNumber(result, toCurrency)} {toCurrency}
                      </div>
                      <div className="text-sm text-muted-foreground mt-3 border-t border-green-100 dark:border-green-800 pt-3">
                        1 {fromCurrency} = {formatNumber(result / parseFloat(amount), toCurrency)} {toCurrency}
                      </div>
                    </div>

                    {(fromCurrency === 'NGN' || toCurrency === 'NGN') && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          Market Comparison
                          <span className="text-xs text-muted-foreground">(NGN)</span>
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {competitorRates.map((competitor, index) => (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              key={competitor.name}
                              className={`relative overflow-hidden rounded-lg ${
                                competitor.name === 'trustBank'
                                  ? 'bg-gradient-to-br from-green-600 to-green-700 text-white'
                                  : 'bg-white dark:bg-black/40'
                              } p-4 shadow-sm`}
                            >
                              <div className="font-medium">{competitor.name}</div>
                              <div className="text-lg font-semibold mt-1">
                                {formatNumber(competitor.rate, 'NGN')}
                              </div>
                              {competitor.name === 'trustBank' && (
                                <>
                                  <div className="text-xs mt-1 text-green-100">Best Rate!</div>
                                  <div className="absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8">
                                    <div className="absolute inset-0 bg-white/10 rotate-45"></div>
                                  </div>
                                </>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg"
          >
            <p className="font-medium">Note:</p>
            <p>The conversion results shown are estimates. Actual rates may vary slightly at the time of transaction due to market volatility and network conditions.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 