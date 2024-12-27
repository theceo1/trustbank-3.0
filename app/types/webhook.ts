export enum TransactionType {
    BUY = 'buy',
    SELL = 'sell',
    WITHDRAWAL = 'withdrawal'
  }
  
  export enum TransactionStatus {
    COMPLETED = 'completed',
    FAILED = 'failed',
    PENDING = 'pending'
  }
  
  export type QuidaxWebhookEvent = {
    event: QuidaxWebhookEventType;
    data: any;
  }
  
  export type QuidaxWebhookEventType = 
    | 'instant_order.done'
    | 'instant_order.cancelled'
    | 'instant_order.failed'
    | 'swap_transaction.completed'
    | 'swap_transaction.reversed'
    | 'swap_transaction.failed'
    | 'withdraw.successful'
    | 'withdraw.rejected'
    | 'order.done'
    | 'order.cancelled'
    | 'wallet.update';