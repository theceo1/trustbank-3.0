"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface OrderBookEntry {
  price: string;
  volume: string;
  total: number;
}

interface OrderBookData {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
}

export default function OrderBook() {
  const [orderBook, setOrderBook] = useState<OrderBookData>({ asks: [], bids: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const response = await fetch('https://www.quidax.com/api/v1/markets/btcngn/order_book');
        if (!response.ok) {
          throw new Error('Failed to fetch order book');
        }
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          // Transform the data to match our interface
          const transformedData = {
            asks: data.data.asks.map((ask: any) => ({
              price: ask.price,
              volume: ask.volume,
              total: parseFloat(ask.price) * parseFloat(ask.volume)
            })),
            bids: data.data.bids.map((bid: any) => ({
              price: bid.price,
              volume: bid.volume,
              total: parseFloat(bid.price) * parseFloat(bid.volume)
            }))
          };
          setOrderBook(transformedData);
        }
      } catch (err) {
        console.error('Error fetching order book:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch order book');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800/50 border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Order Book</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Asks (Sell Orders) */}
          <div className="space-y-1">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={`ask-loading-${i}`} className="animate-pulse h-8 bg-gray-100 dark:bg-gray-700 rounded" />
              ))
            ) : (
              orderBook.asks.map((ask, i) => (
                <div
                  key={`ask-${i}`}
                  className="grid grid-cols-3 text-sm py-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  style={{
                    background: `linear-gradient(to left, rgba(239, 68, 68, 0.1) ${Math.min((parseFloat(ask.volume) / 5) * 100, 100)}%, transparent 0%)`
                  }}
                >
                  <span className="text-red-600 dark:text-red-400 font-medium">{formatCurrency(parseFloat(ask.price), 'NGN')}</span>
                  <span className="text-right text-gray-600 dark:text-gray-400">{formatNumber(parseFloat(ask.volume))}</span>
                  <span className="text-right text-gray-600 dark:text-gray-400">{formatCurrency(ask.total, 'NGN')}</span>
                </div>
              ))
            )}
          </div>

          {/* Spread */}
          <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded">
            Spread: {formatCurrency(
              orderBook.asks[0] && orderBook.bids[0]
                ? parseFloat(orderBook.asks[0].price) - parseFloat(orderBook.bids[0].price)
                : 0,
              'NGN'
            )}
          </div>

          {/* Bids (Buy Orders) */}
          <div className="space-y-1">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={`bid-loading-${i}`} className="animate-pulse h-8 bg-gray-100 dark:bg-gray-700 rounded" />
              ))
            ) : (
              orderBook.bids.map((bid, i) => (
                <div
                  key={`bid-${i}`}
                  className="grid grid-cols-3 text-sm py-1 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                  style={{
                    background: `linear-gradient(to left, rgba(34, 197, 94, 0.1) ${Math.min((parseFloat(bid.volume) / 5) * 100, 100)}%, transparent 0%)`
                  }}
                >
                  <span className="text-green-600 dark:text-green-400 font-medium">{formatCurrency(parseFloat(bid.price), 'NGN')}</span>
                  <span className="text-right text-gray-600 dark:text-gray-400">{formatNumber(parseFloat(bid.volume))}</span>
                  <span className="text-right text-gray-600 dark:text-gray-400">{formatCurrency(bid.total, 'NGN')}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 