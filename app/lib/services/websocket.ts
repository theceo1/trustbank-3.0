import { QuidaxService } from './quidax';

interface WebSocketMessage {
  pair: string;
  rate: number;
  fee?: number;
  total?: number;
}

export class WebSocketService {
  private static ws: WebSocket | null = null;
  private static subscribers: Map<string, (data: WebSocketMessage) => void> = new Map();
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 1000;

  static connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(process.env.NEXT_PUBLIC_QUIDAX_WS_URL!);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.subscribeToAllPairs();
    };

    this.ws.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        const subscribers = this.subscribers.get(data.pair);
        if (subscribers) {
          subscribers(data);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  static subscribe(channel: string, callback: (data: WebSocketMessage) => void) {
    if (!this.ws) this.connect();

    this.subscribers.set(channel, callback);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        event: 'subscribe',
        pair: channel
      }));
    }

    return () => {
      this.subscribers.delete(channel);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          event: 'unsubscribe',
          pair: channel
        }));
      }
    };
  }

  private static subscribeToAllPairs() {
    this.subscribers.forEach((_, pair) => {
      this.ws?.send(JSON.stringify({
        event: 'subscribe',
        pair
      }));
    });
  }

  static disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }

  static unsubscribe(channel: string) {
    this.subscribers.delete(channel);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        event: 'unsubscribe',
        pair: channel
      }));
    }
  }
}