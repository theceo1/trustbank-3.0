import { useState } from "react";

import { useEffect } from "react";

export function OrderBook({ currency }: { currency: string }) {
  const [orders, setOrders] = useState<{bids: any[], asks: any[]}>({ bids: [], asks: [] });
  
  useEffect(() => {
    const ws = new WebSocket('wss://ws.quidax.com');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders(data);
    };
    return () => ws.close();
  }, [currency]);
  
  // Render order book
} 