import { TradeDetails } from "./trade";

export const PLATFORM_FEES = {
  quidax: 0.014, // 1.4% Quidax fee
  platform: 0.016, // 1.6% Platform fee
  total: 0.03 // 3% Total fee
};

export type PaymentMethodType = 'bank_transfer' | 'card' | 'wallet';

export interface PaymentMethod {
  id: string;
  type: 'wallet' | 'card' | 'bank_transfer';
  title: string;
  description: string;
  enabled: boolean;
}

export interface PaymentDetails {
  method: PaymentMethodType;
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  reference?: string;
}

export interface PaymentMethodSelectionProps {
  availableMethods: PaymentMethodType[];
  onSelect: (method: PaymentMethodType) => void;
  selectedMethod: PaymentMethodType;
  walletBalance?: number;
}

export type PaymentStatus = 
  | 'initiated'
  | 'pending'
  | 'processing'
  | 'confirming'
  | 'completed'
  | 'failed';

export interface PaymentResult {
  status: PaymentStatus;
  trade_id: string;
  reference: string;
  payment_url?: string;
}

export interface PaymentProcessorProps {
  trade: TradeDetails;
  onComplete: (result: PaymentResult) => void;
}

export interface PaymentStatusProps {
  status: PaymentStatus;
  amount: number;
  currency: string;
  reference?: string;
  transactionId?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export interface PaymentProgressIndicatorProps {
  status: PaymentStatus;
  showEstimatedTime?: boolean;
}

export interface LivePaymentStatusProps {
  tradeId: string;
  initialStatus: PaymentStatus;
  amount: number;
  currency: string;
  onStatusChange?: (status: PaymentStatus) => void;
}

export interface PaymentConfirmationProps {
  trade: TradeDetails;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}