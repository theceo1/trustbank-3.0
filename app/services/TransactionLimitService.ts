interface ValidationResult {
    valid: boolean;
    reason?: string;
  }
  
  export class TransactionLimitService {
    private static LIMITS = {
      BTC: { min: 10, max: 100000 },
      ETH: { min: 10, max: 100000 },
      USDT: { min: 10, max: 100000 },
      USDC: { min: 10, max: 100000 }
    };
  
    static validateCryptoAmount(
      currency: string,
      amount: number
    ): ValidationResult {
      // Check if currency is supported
      if (!this.LIMITS[currency as keyof typeof this.LIMITS]) {
        return {
          valid: false,
          reason: 'Unsupported cryptocurrency'
        };
      }
  
      const limits = this.LIMITS[currency as keyof typeof this.LIMITS];
  
      // Check minimum amount
      if (amount < limits.min) {
        return {
          valid: false,
          reason: `Minimum trade amount is ${limits.min} USD`
        };
      }
  
      // Check maximum amount
      if (amount > limits.max) {
        return {
          valid: false,
          reason: `Maximum trade amount is ${limits.max} USD`
        };
      }
  
      // Add daily limit check
      // TODO: Implement daily limit checking from database
  
      return { valid: true };
    }
  
    static async getDailyTradeVolume(userId: string): Promise<number> {
      // TODO: Implement daily trade volume calculation
      return 0;
    }
  }