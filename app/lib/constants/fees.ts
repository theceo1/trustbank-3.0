import { PaymentMethodType } from '@/app/types/payment';

export const FEES = {
  QUIDAX_RATE: 0.014, // 1.4%
  PLATFORM_RATE: 0.016, // 1.6%
  
  PAYMENT_METHODS: {
    bank_transfer: {
      percentage: 0.0015, // 0.15%
      fixed: 100 // ₦100
    },
    card: {
      percentage: 0.015, // 1.5%
      fixed: 100 // ₦100
    },
    wallet: {
      percentage: 0,
      fixed: 0
    }
  } as Record<PaymentMethodType, { percentage: number; fixed: number }>
};