"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, RefreshCcw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarketComparisonService } from "@/app/lib/services/marketComparison";
import { ExchangeRate } from "@/app/lib/services/marketComparison";
import AnimatedNumber from "@/app/components/calculator/AnimatedNumber";
import ComparisonTable from "@/app/components/calculator/ComparisonTable";
import { CryptoRateService } from '@/app/lib/services/cryptoRates';

const CRYPTO_OPTIONS = [
  { value: "BTC", label: "Bitcoin", icon: "₿", color: "bg-orange-500" },
  { value: "ETH", label: "Ethereum", icon: "Ξ", color: "bg-blue-500" },
  { value: "USDT", label: "Tether", icon: "₮", color: "bg-green-500" },
  { value: "USDC", label: "USD Coin", icon: "₵", color: "bg-blue-400" }
] as const;

interface CalculatedResult {
  ngnAmount: number;
  cryptoAmount: number;
  usdAmount: number;
  rate: number;
  competitorRates: ExchangeRate[];
  feesByMethod: any[];
  lastUpdated: string;
}

export default function Calculator() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<"BTC" | "ETH" | "USDT" | "USDC">("BTC");
  const [transactionType, setTransactionType] = useState<"buy" | "sell">("buy");
  const [loading, setLoading] = useState(false);
  const [calculatedValue, setCalculatedValue] = useState<CalculatedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleCalculate = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRefreshing(true);
      
      const usdAmount = parseFloat(amount);
      const cryptoPrice = await CryptoRateService.getCryptoUSDPrice(selectedCurrency);
      const cryptoAmount = usdAmount / cryptoPrice;

      const [rateResponse, competitorRates] = await Promise.all([
        CryptoRateService.getRate({
          amount: usdAmount,
          currency: selectedCurrency,
          type: transactionType
        }),
        MarketComparisonService.getCompetitorRates(selectedCurrency)
      ]);

      const ngnAmount = usdAmount * rateResponse.rate;

      setCalculatedValue({
        ngnAmount,
        cryptoAmount,
        usdAmount,
        rate: rateResponse.rate,
        competitorRates: competitorRates.filter(rate => rate.exchange !== 'trustBank'),
        feesByMethod: [rateResponse.fees],
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Calculation error:', error);
      setError(error instanceof Error ? error.message : "Failed to calculate rate. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CRYPTO_OPTIONS.map((crypto) => (
          <motion.div
            key={crypto.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={selectedCurrency === crypto.value ? "default" : "outline"}
              className={`w-full h-12 ${selectedCurrency === crypto.value ? crypto.color : ''}`}
              onClick={() => setSelectedCurrency(crypto.value)}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg mb-0.5">{crypto.icon}</span>
                <span className="text-xs">{crypto.label}</span>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <Card className="backdrop-blur-sm bg-white/10 dark:bg-black/10">
        <CardContent className="p-6 space-y-6">
          <Tabs 
            defaultValue="buy" 
            className="w-full" 
            onValueChange={(value) => setTransactionType(value as "buy" | "sell")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-600">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">Sell</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Enter amount in USD"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          <Button 
            className={`w-full h-12 text-lg ${
              transactionType === 'buy' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            }`}
            onClick={handleCalculate}
            disabled={loading || !amount}
          >
            {loading ? "Calculating..." : "Calculate Rate"}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {calculatedValue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">
                    {transactionType === 'buy' ? 'Buy' : 'Sell'} {selectedCurrency}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCalculate()}
                    className="hover:text-green-500"
                    disabled={refreshing}
                  >
                    <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        You {transactionType === 'buy' ? 'Pay' : 'Get'} (NGN)
                      </p>
                      <AnimatedNumber 
                        value={calculatedValue.ngnAmount}
                        prefix="₦"
                      />
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        You {transactionType === 'buy' ? 'Get' : 'Send'} ({selectedCurrency})
                      </p>
                      <AnimatedNumber 
                        value={calculatedValue.cryptoAmount}
                        precision={8}
                      />
                    </div>
                  </div>

                  <ComparisonTable 
                    competitorRates={calculatedValue.competitorRates}
                    ourRate={calculatedValue.rate}
                    type={transactionType}
                  />
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Rate: ₦{calculatedValue.rate.toLocaleString()} / USD</span>
                  <span>Last updated: {calculatedValue.lastUpdated}</span>
                </div>

                <Button 
                  className={`w-full mt-4 ${
                    transactionType === 'buy' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={() => router.push(`/trade?amount=${calculatedValue.cryptoAmount}&currency=${selectedCurrency}&type=${transactionType}`)}
                >
                  Proceed to Trade
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}