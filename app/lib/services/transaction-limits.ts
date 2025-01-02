import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TransactionLimits {
  daily: number;
  monthly: number;
}

interface VerificationTier {
  verified: boolean;
  limits: TransactionLimits;
}

interface UserVerificationStatus {
  tier1: VerificationTier;
  tier2: VerificationTier;
  tier3: VerificationTier;
}

export class TransactionLimitService {
  static async checkTransactionLimits(userId: string, amount: number): Promise<{
    allowed: boolean;
    reason?: string;
    currentLimits?: TransactionLimits;
    nextTierLimits?: TransactionLimits;
  }> {
    try {
      // Get user's verification status and transaction history
      const [profileResult, transactionsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select(`
            tier1_verified,
            tier2_verified,
            tier3_verified,
            verification_limits
          `)
          .eq('user_id', userId)
          .single(),
        supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (profileResult.error) throw profileResult.error;
      if (transactionsResult.error) throw transactionsResult.error;

      const profile = profileResult.data;
      const transactions = transactionsResult.data;

      // Determine user's current tier and limits
      let currentTier: 1 | 2 | 3 = 1;
      if (profile.tier3_verified) currentTier = 3;
      else if (profile.tier2_verified) currentTier = 2;

      const limits = profile.verification_limits[`tier${currentTier}`];
      const nextTierLimits = currentTier < 3 ? profile.verification_limits[`tier${currentTier + 1}`] : null;

      // Calculate daily and monthly totals
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const dailyTotal = transactions
        .filter(tx => tx.created_at >= todayStart)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      const monthlyTotal = transactions
        .filter(tx => tx.created_at >= monthStart)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      // Check if transaction would exceed limits
      if (dailyTotal + amount > limits.daily) {
        return {
          allowed: false,
          reason: `Transaction would exceed daily limit of ₦${limits.daily.toLocaleString()}`,
          currentLimits: limits,
          nextTierLimits
        };
      }

      if (monthlyTotal + amount > limits.monthly) {
        return {
          allowed: false,
          reason: `Transaction would exceed monthly limit of ₦${limits.monthly.toLocaleString()}`,
          currentLimits: limits,
          nextTierLimits
        };
      }

      return {
        allowed: true,
        currentLimits: limits,
        nextTierLimits
      };
    } catch (error) {
      console.error('Error checking transaction limits:', error);
      throw error;
    }
  }
} 