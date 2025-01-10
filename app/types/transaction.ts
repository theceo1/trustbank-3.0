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

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  reference?: string;
  paymentMethod?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TransactionListProps {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}