import { TradeStatus, TradeDetails } from '@/app/types/trade';

export class TradeNotifications {
  static async requestPermission() {
    if (!('Notification' in window)) return;
    
    return Notification.requestPermission();
  }

  static async notifyTradeStatus(trade: TradeDetails) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const messages = {
      completed: `Your ${trade.type} trade for ${trade.amount} ${trade.currency} has been completed`,
      failed: `Your trade has failed. Please check your dashboard for details`,
      processing: `Your trade is being processed`,
    };

    const message = messages[trade.status as keyof typeof messages];
    if (!message) return;

    new Notification('Trade Update', {
      body: message,
      icon: '/trade-icon.png'
    });
  }

  static async setupTradeNotifications(tradeId: string) {
    await this.requestPermission();
    
    // Setup WebSocket or polling for real-time updates
    // This is a placeholder for the actual implementation
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.tradeId === tradeId) {
        this.notifyTradeStatus(data.trade);
      }
    };

    return () => ws.close();
  }
}