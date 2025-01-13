import { QuidaxService } from './quidax';

interface WebSocketMessage {
  event: string;
  topic: string;
  payload: any;
  ref?: string;
}

export class WebSocketService {
  private static ws: WebSocket | null = null;
  private static subscribers: Map<string, (data: any) => void> = new Map();
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 1000;
  private static heartbeatInterval: NodeJS.Timeout | null = null;

  static connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(process.env.NEXT_PUBLIC_QUIDAX_WS_URL!);

    this.ws.onopen = () => {
      console.log('[WebSocketService] Connected');
      this.reconnectAttempts = 0;
      this.setupHeartbeat();
      this.subscribeToAllPairs();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.event) {
          case 'phx_reply':
            if (message.payload.status === 'error') {
              console.error('[WebSocketService] Channel error:', message.payload);
              this.handleReconnect();
            }
            break;
            
          case 'update':
            const subscribers = this.subscribers.get(message.topic);
            if (subscribers) {
              subscribers(message.payload);
            }
            break;
            
          default:
            break;
        }
      } catch (error) {
        console.error('[WebSocketService] Message parsing error:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('[WebSocketService] Connection closed');
      this.clearHeartbeat();
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocketService] Error:', error);
      this.clearHeartbeat();
    };
  }

  private static setupHeartbeat() {
    this.clearHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          topic: "phoenix",
          event: "heartbeat",
          payload: {},
          ref: "1"
        }));
      }
    }, 30000);
  }

  private static clearHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  static subscribe(channel: string, callback: (data: any) => void) {
    if (!this.ws) this.connect();

    const topic = `${channel}`;
    this.subscribers.set(topic, callback);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        topic,
        event: 'phx_join',
        payload: {},
        ref: "1"
      }));
    }

    return () => this.unsubscribe(channel);
  }

  private static handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketService] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  private static subscribeToAllPairs() {
    this.subscribers.forEach((_, topic) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          topic,
          event: 'phx_join',
          payload: {},
          ref: "1"
        }));
      }
    });
  }

  static disconnect() {
    this.clearHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
  }

  static unsubscribe(channel: string) {
    const topic = `${channel}`;
    this.subscribers.delete(topic);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        topic,
        event: 'phx_leave',
        payload: {},
        ref: "1"
      }));
    }
  }
}