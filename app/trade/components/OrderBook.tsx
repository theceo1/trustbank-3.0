import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { QUIDAX_WEBSOCKET_URL } from "@/app/lib/constants/api";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Order {
  price: string;
  amount: string;
  total: string;
}

interface OrderBookProps {
  currency: string;
}

export function OrderBook({ currency }: OrderBookProps) {
  const [orders, setOrders] = useState<{bids: Order[], asks: Order[]}>({ bids: [], asks: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const MAX_RETRIES = 3;
  
  const fetchOrderBookREST = useCallback(async () => {
    try {
      const response = await fetch(`/api/market/orderbook/${currency}ngn`);
      if (!response.ok) {
        throw new Error('Failed to fetch order book');
      }
      const data = await response.json();
      if (data.status === 'success') {
        setOrders({
          bids: data.data.bids || [],
          asks: data.data.asks || []
        });
        setIsLoading(false);
      }
    } catch (error) {
      console.error('[OrderBook] REST API error:', error);
      setConnectionState('error');
    }
  }, [currency]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let pingInterval: NodeJS.Timeout;
    let isConnecting = false;
    
    const connect = () => {
      if (isConnecting) return;
      
      try {
        isConnecting = true;
        setConnectionState('connecting');
        ws = new WebSocket(QUIDAX_WEBSOCKET_URL);
        
        ws.onopen = () => {
          isConnecting = false;
          setConnectionState('connected');
          
          // Subscribe to order book data
          const subscribeMessage = {
            event: 'subscribe',
            channels: ['orderbook'],
            markets: [`${currency}ngn`]
          };
          ws?.send(JSON.stringify(subscribeMessage));
          
          // Set up ping interval to keep connection alive
          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ event: 'ping' }));
            }
          }, 30000);
          
          setRetryCount(0);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.event === 'pong') return;
            
            if (data.event === 'update' && data.channel === 'orderbook') {
              // Transform the data to match our format
              const transformedOrders = {
                bids: data.data.bids.map(([price, amount]: [string, string]) => ({
                  price,
                  amount,
                  total: (parseFloat(price) * parseFloat(amount)).toString()
                })),
                asks: data.data.asks.map(([price, amount]: [string, string]) => ({
                  price,
                  amount,
                  total: (parseFloat(price) * parseFloat(amount)).toString()
                }))
              };
              
              setOrders(transformedOrders);
              setIsLoading(false);
            }
          } catch (error) {
            console.error('[OrderBook] Error parsing orderbook data:', error);
          }
        };
        
        ws.onclose = (event) => {
          isConnecting = false;
          clearInterval(pingInterval);
          setConnectionState('disconnected');
          
          if (retryCount < MAX_RETRIES) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Cap at 10 seconds
            reconnectTimeout = setTimeout(() => {
              setRetryCount(prev => prev + 1);
              connect();
            }, delay);
          } else {
            fetchOrderBookREST();
          }
        };
        
        ws.onerror = () => {
          isConnecting = false;
          setConnectionState('error');
          if (retryCount >= MAX_RETRIES) {
            fetchOrderBookREST();
          }
        };
      } catch (error) {
        isConnecting = false;
        setConnectionState('error');
        if (retryCount >= MAX_RETRIES) {
          fetchOrderBookREST();
        }
      }
    };

    connect();
    
    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(pingInterval);
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [currency, retryCount, setConnectionState, fetchOrderBookREST]);
  
  if (connectionState === 'error' && orders.bids.length === 0 && orders.asks.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to load order book. Please refresh the page to try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || connectionState === 'connecting') {
    return (
      <div className="text-center py-4 text-gray-500">
        {connectionState === 'connecting' ? 'Connecting to order book...' : 'Loading order book...'}
      </div>
    );
  }

  if (orders.bids.length === 0 && orders.asks.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No orders available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-red-500 mb-2">Sell Orders</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Price (NGN)</TableHead>
              <TableHead>Amount ({currency.toUpperCase()})</TableHead>
              <TableHead>Total (NGN)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.asks.slice(0, 5).map((order, index) => (
              <TableRow key={index}>
                <TableCell className="text-red-500">{formatNumber(parseFloat(order.price))}</TableCell>
                <TableCell>{formatNumber(parseFloat(order.amount))}</TableCell>
                <TableCell>{formatNumber(parseFloat(order.total))}</TableCell>
              </TableRow>
            ))}
            {orders.asks.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">No sell orders</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="text-sm font-medium text-green-500 mb-2">Buy Orders</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Price (NGN)</TableHead>
              <TableHead>Amount ({currency.toUpperCase()})</TableHead>
              <TableHead>Total (NGN)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.bids.slice(0, 5).map((order, index) => (
              <TableRow key={index}>
                <TableCell className="text-green-500">{formatNumber(parseFloat(order.price))}</TableCell>
                <TableCell>{formatNumber(parseFloat(order.amount))}</TableCell>
                <TableCell>{formatNumber(parseFloat(order.total))}</TableCell>
              </TableRow>
            ))}
            {orders.bids.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">No buy orders</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 