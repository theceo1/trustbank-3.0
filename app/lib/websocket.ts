// app/lib/websocket.ts

import { WebSocketMessage, WebSocketState, BinanceTickerMessage } from '@/app/types/websocket';

class CryptoWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private subscribers: Set<(data: WebSocketState) => void> = new Set();
  private state: WebSocketState = {
    isConnected: false,
    prices: {},
    lastUpdate: Date.now(),
    error: null
  };

  constructor(private url: string = 'wss://stream.binance.com:9443/ws') {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleError(error);
    }
  }

  private setupEventListeners() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.updateState({ isConnected: true, error: null });
      console.log('WebSocket connected');
    };

    this.ws.onclose = () => {
      this.updateState({ isConnected: false });
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      this.handleError(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage) {
    if (this.isTickerMessage(message)) {
      const { s: symbol, c: price, P: priceChange } = message;
      this.updateState({
        prices: {
          ...this.state.prices,
          [symbol]: {
            price: parseFloat(price),
            change: parseFloat(priceChange)
          }
        },
        lastUpdate: Date.now()
      });
    }
  }

  private isTickerMessage(message: any): message is BinanceTickerMessage {
    return message && message.e === 'ticker' && 
           typeof message.s === 'string' && 
           typeof message.c === 'string' && 
           typeof message.P === 'string';
  }

  private handleError(error: any) {
    this.updateState({
      error: error instanceof Error ? error : new Error('WebSocket error'),
      isConnected: false
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.updateState({
        error: new Error('Max reconnection attempts reached'),
        isConnected: false
      });
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, this.reconnectTimeout * this.reconnectAttempts);
  }

  private updateState(newState: Partial<WebSocketState>) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  subscribe(symbols: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      setTimeout(() => this.subscribe(symbols), 1000);
      return;
    }

    const subscribeMsg = {
      method: 'SUBSCRIBE',
      params: symbols.map(s => `${s.toLowerCase()}@ticker`),
      id: Date.now()
    };

    this.ws.send(JSON.stringify(subscribeMsg));
  }

  unsubscribe(symbols: string[]) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const unsubscribeMsg = {
      method: 'UNSUBSCRIBE',
      params: symbols.map(s => `${s.toLowerCase()}@ticker`),
      id: Date.now()
    };

    this.ws.send(JSON.stringify(unsubscribeMsg));
  }

  onStateChange(callback: (state: WebSocketState) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
export const cryptoWebSocket = new CryptoWebSocket();