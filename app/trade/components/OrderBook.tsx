import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";

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
  
  useEffect(() => {
    const ws = new WebSocket('wss://ws.quidax.com');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        event: 'subscribe',
        markets: [`${currency}ngn`]
      }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'orderbook') {
          setOrders({
            bids: data.bids || [],
            asks: data.asks || []
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error parsing orderbook data:', error);
      }
    };
    
    return () => {
      ws.close();
    };
  }, [currency]);
  
  if (isLoading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Loading order book...
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 