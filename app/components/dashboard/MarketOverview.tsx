"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MarketTicker {
  buy: string;
  sell: string;
  low: string;
  high: string;
  last: string;
  volume: string;
  change: string;
  market_name: string;
}

interface MarketOverviewProps {
  className?: string;
}

const CORE_PAIRS = ['btcngn', 'ethngn', 'usdtngn', 'bnbngn'];

export function MarketOverview({ className }: MarketOverviewProps) {
  const [marketData, setMarketData] = useState<Record<string, MarketTicker> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState('btcngn');

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market/tickers');
        if (!response.ok) {
          throw new Error('Failed to fetch market data');
        }
        const data = await response.json();
        if (data.status === 'success') {
          setMarketData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch market data');
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className={cn(className, "bg-background/50 backdrop-blur-sm")}>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !marketData) {
    return (
      <Card className={cn(className, "bg-background/50 backdrop-blur-sm")}>
        <CardContent className="p-6">
          <p className="text-red-500">Failed to load market data</p>
        </CardContent>
      </Card>
    );
  }

  const corePairs = CORE_PAIRS.map(pair => ({
    pair,
    data: marketData[pair],
    formattedPrice: parseFloat(marketData[pair]?.last || '0').toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }),
    change: parseFloat(marketData[pair]?.change || '0')
  }));

  return (
    <Card className={cn(className, "bg-background/50 backdrop-blur-sm border-none shadow-xl")}>
      <CardHeader className="border-b border-border/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            Market Overview
          </CardTitle>
          <motion.div 
            className="text-sm text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Live
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {corePairs.map(({ pair, data, formattedPrice, change }) => (
            <motion.div
              key={pair}
              className={cn(
                "p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all",
                "cursor-pointer bg-background/50 backdrop-blur-sm",
                selectedPair === pair && "border-primary"
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedPair(pair)}
              layout
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {pair.slice(0, -3).toUpperCase()}/NGN
                  </h3>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={formattedPrice}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="text-2xl font-bold mt-1"
                    >
                      {formattedPrice}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className={cn(
                  "flex items-center space-x-1 px-2 py-1 rounded",
                  change >= 0 ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
                )}>
                  {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-sm font-medium">
                    {change >= 0 ? "+" : ""}{change}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-4">
                <div>
                  <p>24h High</p>
                  <p className="font-medium">{parseFloat(data?.high || '0').toLocaleString()}</p>
                </div>
                <div>
                  <p>24h Low</p>
                  <p className="font-medium">{parseFloat(data?.low || '0').toLocaleString()}</p>
                </div>
                <div>
                  <p>Volume</p>
                  <p className="font-medium">{parseFloat(data?.volume || '0').toLocaleString()}</p>
                </div>
              </div>
              <motion.div 
                className="flex items-center justify-end mt-4 text-sm text-primary hover:text-primary/80"
                whileHover={{ x: 5 }}
              >
                Trade Now <ArrowRight className="h-4 w-4 ml-1" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 