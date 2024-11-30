import { PaymentMethodType } from '@/app/types/payment';

export const PaymentProcessors = {
  wallet: async () => import('./WalletPaymentProcessor'),
  bank_transfer: async () => import('./BankTransferProcessor'),
  card: async () => import('./CardPaymentProcessor')
} as const;