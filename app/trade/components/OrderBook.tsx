"use client";

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { formatNumber } from '@/app/lib/utils';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OrderBookEntry {
  id: string;
  side: string;
  price: string;
  volume: string;
  executed_volume: string;
  trades_count: number;
  created_at: string;
  updated_at: string;
}

interface OrderBookData {
  status: string;
  message: string;
  data: {
    asks: OrderBookEntry[];
    bids: OrderBookEntry[];
  };
}

interface OrderBookProps {
  market: string;
}

export default function OrderBook({ market = "usdtngn" }: OrderBookProps) {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize the processed data to prevent unnecessary re-renders
  const { processedAsks, processedBids, spread } = useMemo(() => {
    if (!orderBook?.data) {
      return { processedAsks: [], processedBids: [], spread: 0 };
    }

    const asks = orderBook.data.asks.map((ask: OrderBookEntry) => ({
      ...ask,
      total: (parseFloat(ask.price) * (parseFloat(ask.volume) - parseFloat(ask.executed_volume))).toString()
    }));

    const bids = orderBook.data.bids.map((bid: OrderBookEntry) => ({
      ...bid,
      total: (parseFloat(bid.price) * (parseFloat(bid.volume) - parseFloat(bid.executed_volume))).toString()
    }));

    // Calculate spread
    const lowestAsk = asks[0]?.price ? parseFloat(asks[0].price) : 0;
    const highestBid = bids[0]?.price ? parseFloat(bids[0].price) : 0;
    const spread = lowestAsk && highestBid ? ((lowestAsk - highestBid) / lowestAsk) * 100 : 0;

    return { processedAsks: asks, processedBids: bids, spread };
  }, [orderBook]);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await fetch(`/api/market/orderbook/${market}?ask_limit=8&bids_limit=8`);
        if (!response.ok) {
          throw new Error('Failed to fetch order book');
        }
        const data = await response.json();
        setOrderBook(data);
      } catch (error) {
        console.error('Error fetching order book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, [market]);

  if (loading) {
    return (
      <Card className="w-full bg-white dark:bg-gray-800/50 border-none shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[500px] overflow-hidden bg-white dark:bg-gray-800/50 border-none shadow-lg">
      <CardHeader className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Order Book
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Real-time market depth showing buy and sell orders</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Spread: <span className="font-medium">{spread.toFixed(2)}%</span>
          </div>
        </div>
        <CardDescription>
          Market: USDT/NGN • Refreshing every 5s
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-red-500 dark:text-red-400 mb-2">Sell Orders</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-muted-foreground text-sm">
                    <th className="text-left pb-2">Price (NGN)</th>
                    <th className="text-right pb-2">Amount (USDT)</th>
                    <th className="text-right pb-2">Total (NGN)</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="sync">
                    {processedAsks.slice(0, 8).map((ask) => {
                      const availableVolume = parseFloat(ask.volume) - parseFloat(ask.executed_volume);
                      return (
                        <motion.tr
                          key={ask.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm text-red-500 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="py-1">{formatNumber(parseFloat(ask.price))}</td>
                          <td className="text-right">{formatNumber(availableVolume, 2)}</td>
                          <td className="text-right">{formatNumber(parseFloat(ask.total))}</td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-green-500 dark:text-green-400 mb-2">Buy Orders</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-muted-foreground text-sm">
                    <th className="text-left pb-2">Price (NGN)</th>
                    <th className="text-right pb-2">Amount (USDT)</th>
                    <th className="text-right pb-2">Total (NGN)</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="sync">
                    {processedBids.slice(0, 8).map((bid) => {
                      const availableVolume = parseFloat(bid.volume) - parseFloat(bid.executed_volume);
                      return (
                        <motion.tr
                          key={bid.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm text-green-500 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="py-1">{formatNumber(parseFloat(bid.price))}</td>
                          <td className="text-right">{formatNumber(availableVolume, 2)}</td>
                          <td className="text-right">{formatNumber(parseFloat(bid.total))}</td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 