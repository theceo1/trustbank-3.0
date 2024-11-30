import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PaymentMethod } from '@/app/types/payment';

export class PaymentCache {
  private static cache = new Map<string, any>();
  private static supabase = createClientComponentClient();

  static async getPaymentMethods(currency: string): Promise<PaymentMethod[]> {
    const cacheKey = `payment_methods_${currency}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Fetch from API
    const { data } = await this.supabase
      .from('payment_methods')
      .select('*')
      .eq('currency', currency)
      .eq('is_active', true);

    // Cache the result
    this.cache.set(cacheKey, data);
    
    // Set cache expiry
    setTimeout(() => {
      this.cache.delete(cacheKey);
    }, 5 * 60 * 1000); // 5 minutes

    return data || [];
  }

  static clearCache() {
    this.cache.clear();
  }
}