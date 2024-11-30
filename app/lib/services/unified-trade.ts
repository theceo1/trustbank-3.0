import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TradeDetails, TradeType } from '@/app/types/trade';
import { QuidaxService } from './quidax';
import { Database } from '@/app/types/database';
import { WalletService } from './wallet';
import { PaymentProcessorFactory } from './payment/PaymentProcessorFactory';

interface QuidaxTradeResponse {
  reference: string;
  status: string;
  // Add other Quidax-specific fields as needed
}

interface TradeRecord extends TradeDetails {
  id: string;
  quidax_reference?: string;
}

export class UnifiedTradeService {
  private static supabase = createClientComponentClient<Database>();

  static async createTrade(details: TradeDetails): Promise<TradeRecord> {
    try {
      // 1. Verify KYC level
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('kyc_level, quidax_user_id')
        .eq('id', details.user_id)
        .single();

      if (!profile?.quidax_user_id) {
        throw new Error('User account not found');
      }

      // 2. Handle different payment methods
      const paymentProcessor = PaymentProcessorFactory.getProcessor(details.payment_method);
      await paymentProcessor.validatePayment(details);

      // 3. Create trade record
      const { data: trade, error } = await this.supabase.rpc(
        'create_trade',
        {
          p_user_id: details.user_id,
          p_type: details.type as 'buy' | 'sell',
          p_currency: details.currency,
          p_amount: details.amount,
          p_rate: details.rate,
          p_payment_method: details.payment_method
        }
      );

      if (error) throw error;

      // 4. Create Quidax instant swap
      const quidaxTrade = await QuidaxService.createInstantSwap({
        user_id: profile.quidax_user_id,
        from_currency: details.currency,
        to_currency: 'ngn',
        amount: details.amount,
        type: details.type as 'buy' | 'sell'
      });

      // 5. Initialize payment
      const paymentResult = await paymentProcessor.initializePayment({
        trade_id: trade.id,
        amount: details.total,
        currency: 'NGN',
        user_id: details.user_id,
        quidax_reference: quidaxTrade.reference
      });

      // 6. Update trade with payment info
      await this.supabase
        .from('trades')
        .update({
          quidax_reference: quidaxTrade.reference,
          payment_status: paymentResult.status,
          payment_reference: paymentResult.reference,
          status: 'processing'
        })
        .eq('id', trade.id);

      return {
        ...trade,
        quidax_reference: quidaxTrade.reference,
        payment_reference: paymentResult.reference
      };
    } catch (error) {
      console.error('Trade creation failed:', error);
      throw error;
    }
  }
} 