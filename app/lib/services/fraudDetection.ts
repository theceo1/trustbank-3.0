import supabase from '@/lib/supabase/client';

interface RiskScore {
  score: number;
  flags: string[];
}

export class FraudDetectionService {
  static async analyzeTransaction(params: {
    userId: string;
    amount: number;
    ipAddress: string;
    deviceId: string;
  }) {
    const riskScore = await this.calculateRiskScore(params);
    const riskThreshold = 70; // 0-100 scale

    if (riskScore > riskThreshold) {
      return {
        approved: false,
        reason: 'Transaction flagged for suspicious activity',
        requiresVerification: true
      };
    }

    return { approved: true };
  }

  private static async calculateRiskScore({
    userId,
    amount,
    ipAddress,
    deviceId
  }: {
    userId: string;
    amount: number;
    ipAddress: string;
    deviceId: string;
  }): Promise<number> {
    let score = 0;

    // Check user history
    const userHistory = await this.getUserTransactionHistory(userId);
    score += this.evaluateUserHistory(userHistory);

    // Check IP reputation
    score += await this.checkIPReputation(ipAddress);

    // Check device reputation
    score += await this.checkDeviceReputation(deviceId);

    // Check transaction amount patterns
    score += this.evaluateTransactionAmount(amount, userHistory);

    return score;
  }

  private static async getUserTransactionHistory(userId: string) {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    return data || [];
  }

  private static evaluateUserHistory(history: any[]): number {
    let score = 0;
    
    // New user check
    if (history.length === 0) {
      score += 30;
    }

    // Failed transaction check
    const failedTransactions = history.filter(tx => tx.status === 'failed').length;
    score += failedTransactions * 10;

    return Math.min(score, 100);
  }

  private static async checkIPReputation(ipAddress: string): Promise<number> {
    // Implement IP reputation check logic
    // For now, return a default score
    return 0;
  }

  private static async checkDeviceReputation(deviceId: string): Promise<number> {
    // Implement device reputation check logic
    // For now, return a default score
    return 0;
  }

  private static evaluateTransactionAmount(amount: number, history: any[]): number {
    let score = 0;
    
    // Calculate average transaction amount
    if (history.length > 0) {
      const avgAmount = history.reduce((sum, tx) => sum + tx.amount, 0) / history.length;
      
      // If current amount is significantly higher than average
      if (amount > avgAmount * 3) {
        score += 20;
      }
    }

    return score;
  }
}