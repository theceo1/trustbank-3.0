"use client";

import { useEffect, useState } from 'react';
import { formatCryptoAmount } from '@/app/lib/utils/format';

interface Order {
  price: string;
  volume: string;
  total?: string;
}

interface OrderBookProps {
  market: string;
}

export default function OrderBook({ market }: OrderBookProps) {
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the base and quote currency from the market pair
  const [baseCurrency, quoteCurrency] = [market.slice(0, -3), market.slice(-3)].map(c => c.toUpperCase());

  const fetchOrderBook = async () => {
    try {
      const response = await fetch(`/api/market/orderbook/${market}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order book');
      }
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        if (data.data.bids) setBids(data.data.bids.map(transformOrder));
        if (data.data.asks) setAsks(data.data.asks.map(transformOrder));
        setError(null);
      } else {
        throw new Error('Invalid order book data received');
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
      setError('Failed to fetch order book data');
    } finally {
      setIsLoading(false);
    }
  };

  const transformOrder = (order: any): Order => ({
    price: order.price || '0',
    volume: order.volume || '0',
    total: order.total || '0'
  });

  useEffect(() => {
    fetchOrderBook();
    
    // Poll every 5 seconds
    const interval = setInterval(fetchOrderBook, 5000);
    
    return () => clearInterval(interval);
  }, [market]);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading order book...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="space-y-2">
        <h3 className="text-green-500 font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Buy Orders ({baseCurrency}-{quoteCurrency})
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2">
            <span>Price ({quoteCurrency})</span>
            <span>Amount ({baseCurrency})</span>
            <span>Total ({quoteCurrency})</span>
          </div>
          {bids.map((bid, index) => (
            <div 
              key={index} 
              className="grid grid-cols-3 text-sm relative overflow-hidden group"
              title={`Buy ${bid.volume} ${baseCurrency} at ${bid.price} ${quoteCurrency}`}
            >
              <div 
                className="absolute inset-0 bg-green-500/10 group-hover:bg-green-500/20 transition-colors"
                style={{ width: `${(parseFloat(bid.total || '0') / Math.max(...bids.map(b => parseFloat(b.total || '0')))) * 100}%` }}
              />
              <span className="text-green-500 relative font-medium">{formatCryptoAmount(bid.price)}</span>
              <span className="relative">{formatCryptoAmount(bid.volume)}</span>
              <span className="relative">{formatCryptoAmount(bid.total)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-red-500 font-semibold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          Sell Orders ({baseCurrency}-{quoteCurrency})
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 text-xs text-muted-foreground mb-2">
            <span>Price ({quoteCurrency})</span>
            <span>Amount ({baseCurrency})</span>
            <span>Total ({quoteCurrency})</span>
          </div>
          {asks.map((ask, index) => (
            <div 
              key={index} 
              className="grid grid-cols-3 text-sm relative overflow-hidden group"
              title={`Sell ${ask.volume} ${baseCurrency} at ${ask.price} ${quoteCurrency}`}
            >
              <div 
                className="absolute inset-0 bg-red-500/10 group-hover:bg-red-500/20 transition-colors"
                style={{ width: `${(parseFloat(ask.total || '0') / Math.max(...asks.map(a => parseFloat(a.total || '0')))) * 100}%` }}
              />
              <span className="text-red-500 relative font-medium">{formatCryptoAmount(ask.price)}</span>
              <span className="relative">{formatCryptoAmount(ask.volume)}</span>
              <span className="relative">{formatCryptoAmount(ask.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 