import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PaymentMethodType } from '@/app/types/payment';
import { FEES } from '@/app/lib/constants/fees';
import { Database } from '@/app/types/database';

export class FeeService {
  private static supabase = createClientComponentClient<Database>();

  static async calculateFees(params: { 
    user_id: string; 
    currency: string; 
    amount: number 
  }): Promise<{
    quidax: number;
    platform: number;
    processing: number;
  }> {
    const { amount } = params;
    return {
      quidax: amount * FEES.QUIDAX_RATE,
      platform: amount * FEES.PLATFORM_RATE,
      processing: this.getProcessingFees('bank_transfer', amount)
    };
  }

  private static getProcessingFees(method: PaymentMethodType, amount: number): number {
    const fees = FEES.PAYMENT_METHODS[method];
    return fees.fixed + (amount * fees.percentage);
  }

  private static getProcessingFeeDetails(method: PaymentMethodType) {
    const fees = FEES.PAYMENT_METHODS[method];
    return {
      percentage: fees.percentage * 100,
      fixed: fees.fixed
    };
  }
}