import { EventEmitter } from 'events';

export enum WebSocketEvent {
  MARKET_UPDATE = 'MARKET_UPDATE',
  TRADE_UPDATE = 'TRADE_UPDATE',
  ORDER_UPDATE = 'ORDER_UPDATE',
  CONNECTION_STATE = 'CONNECTION_STATE',
}

interface WebSocketMessage {
  type: string;
  data: any;
}

class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private eventEmitter = new EventEmitter();
  private isConnected = false;
  private pendingSubscriptions: Set<string> = new Set();

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(url: string): void {
    if (this.ws) {
      return;
    }

    try {
      this.ws = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.eventEmitter.emit(WebSocketEvent.CONNECTION_STATE, true);
      
      // Resubscribe to pending subscriptions
      this.pendingSubscriptions.forEach(subscription => {
        this.send({ type: 'SUBSCRIBE', channel: subscription });
      });
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.isConnected = false;
      this.eventEmitter.emit(WebSocketEvent.CONNECTION_STATE, false);
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.eventEmitter.emit(WebSocketEvent.CONNECTION_STATE, false);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'MARKET_UPDATE':
        this.eventEmitter.emit(WebSocketEvent.MARKET_UPDATE, message.data);
        break;
      case 'TRADE_UPDATE':
        this.eventEmitter.emit(WebSocketEvent.TRADE_UPDATE, message.data);
        break;
      case 'ORDER_UPDATE':
        this.eventEmitter.emit(WebSocketEvent.ORDER_UPDATE, message.data);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect(this.ws?.url || '');
    }, this.reconnectTimeout * Math.pow(2, this.reconnectAttempts));
  }

  public subscribe(channel: string): void {
    this.pendingSubscriptions.add(channel);
    if (this.isConnected) {
      this.send({ type: 'SUBSCRIBE', channel });
    }
  }

  public unsubscribe(channel: string): void {
    this.pendingSubscriptions.delete(channel);
    if (this.isConnected) {
      this.send({ type: 'UNSUBSCRIBE', channel });
    }
  }

  public send(data: any): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(data));
    }
  }

  public on(event: WebSocketEvent, callback: (data: any) => void): void {
    this.eventEmitter.on(event, callback);
  }

  public off(event: WebSocketEvent, callback: (data: any) => void): void {
    this.eventEmitter.off(event, callback);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.pendingSubscriptions.clear();
    this.isConnected = false;
  }
}

export default WebSocketService;