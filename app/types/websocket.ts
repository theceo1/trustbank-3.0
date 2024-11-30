// app/types/websocket.ts

export interface BinanceTickerMessage {
  e: string;          // Event type
  E: number;          // Event time
  s: string;          // Symbol
  p: string;          // Price change
  P: string;          // Price change percent
  w: string;          // Weighted average price
  c: string;          // Last price
  Q: string;          // Last quantity
  o: string;          // Open price
  h: string;          // High price
  l: string;          // Low price
  v: string;          // Total traded base asset volume
  q: string;          // Total traded quote asset volume
}

export interface WebSocketMessage {
  pair: string;
  rate: number;
  fee: number;
  amount?: number;
  timestamp: number;
}

export interface WebSocketState {
  isConnected: boolean;
  prices: {
    [symbol: string]: {
      price: number;
      change: number;
    };
  };
  lastUpdate: number;
  error: Error | null;
}

export interface WebSocketContextType {
  isConnected: boolean;
  prices: {
    [key: string]: number;
  };
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
}