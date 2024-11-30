import { createClient } from '@supabase/supabase-js';
import { KYC_TIERS } from '@/app/lib/constants/kyc-tiers';
import { KYCService } from './kyc';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class TransactionLimitService {
  static async validateTradeAmount(userId: string, totalAmount: number) {
    try {
      // Get user's KYC tier
      const kycStatus = await KYCService.getKYCStatus(userId);
      if (!kycStatus) {
        return { valid: false, reason: 'KYC status not found' };
      }

      // If user is not verified, use the lowest tier limits
      const tier = kycStatus.isVerified ? 'verified' : 'unverified';
      const tierLimits = KYC_TIERS[tier];
      
      // Calculate daily volume
      const dailyVolume = await this.getDailyTradeVolume(userId);
      if (dailyVolume + totalAmount > tierLimits.dailyLimit) {
        return {
          valid: false,
          reason: `Daily limit of ₦${tierLimits.dailyLimit.toLocaleString()} exceeded`
        };
      }

      // Calculate monthly volume
      const monthlyVolume = await this.getMonthlyTradeVolume(userId);
      if (monthlyVolume + totalAmount > tierLimits.monthlyLimit) {
        return {
          valid: false,
          reason: `Monthly limit of ₦${tierLimits.monthlyLimit.toLocaleString()} exceeded`
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('Trade validation error:', error);
      return { valid: false, reason: 'Failed to validate trade limits' };
    }
  }

  private static async getDailyTradeVolume(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('trades')
      .select('total')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', today.toISOString());

    return data?.reduce((sum, trade) => sum + trade.total, 0) || 0;
  }

  private static async getMonthlyTradeVolume(userId: string): Promise<number> {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('trades')
      .select('total')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', firstDayOfMonth.toISOString());

    return data?.reduce((sum, trade) => sum + trade.total, 0) || 0;
  }
}