export class TradeUtils {
    static calculateFees(amount: number, rate: number) {
      const subtotal = amount * rate;
      const serviceFee = subtotal * 0.01; // 1% service fee
      const networkFee = 0.0005; // Fixed network fee
      
      return {
        subtotal,
        serviceFee,
        networkFee,
        total: subtotal + serviceFee + networkFee
      };
    }
  
    static formatAmount(amount: number, currency = 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency === 'NGN' ? 'NGN' : 'USD'
      }).format(amount);
    }
  
    static getEstimatedDeliveryTime(paymentMethod: string) {
      return paymentMethod === 'wallet' ? '5-15 minutes' : '1-2 hours';
    }
  }