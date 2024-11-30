import { TradeDetails } from './trade';

export interface TransactionReceiptProps {
  trade: TradeDetails;
  onDownload: () => void;
}

export interface PaymentStatusAnimationProps {
  status: 'success' | 'error';
  amount: number;
  currency: string;
}