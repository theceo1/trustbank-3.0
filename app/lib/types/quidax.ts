export interface QuidaxTransaction {
    id: string;
    amount: number;
    currency_pair: string;
    side: 'buy' | 'sell';
    status: 'pending' | 'completed' | 'failed';
    payment_reference?: string;
    payment_url?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface QuidaxInitiateResponse {
    status: 'success' | 'error';
    data?: {
      transaction: QuidaxTransaction;
      payment_url: string;
    };
    message?: string;
  }