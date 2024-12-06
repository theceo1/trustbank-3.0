import { PaymentMethodType } from '@/app/types/payment';

export const FEES = {
  QUIDAX: 0.014, // 1.4%
  PLATFORM: 0.016, // 1.6%
  PROCESSING: 0.01, // 1% for payment processing
  
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


export const calculateTradeFees = (amount: number) => {
  return {
    quidax: amount * FEES.QUIDAX,
    platform: amount * FEES.PLATFORM,
    processing: amount * FEES.PROCESSING,
    total: amount * (FEES.QUIDAX + FEES.PLATFORM + FEES.PROCESSING)
  };
};