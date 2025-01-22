import { QuidaxWalletService, getWalletService } from './quidax-wallet';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/app/types/database';

export class WalletService {
  private static supabase = createClientComponentClient<Database>();

  static async getUserBalance(userId: string): Promise<number> {
    try {
      const walletService = getWalletService();
      const response = await walletService.getWallets(userId);
      
      // Sum up the balances from all wallets
      const totalBalance = response.data.reduce((sum: number, wallet: any) => {
        return sum + parseFloat(wallet.balance || '0');
      }, 0);

      return totalBalance;
    } catch (error) {
      console.error('Error fetching user balance:', error);
      return 0;
    }
  }

  static async updateBalance(userId: string, amount: number): Promise<void> {
    try {
      const { data: wallet, error } = await this.supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const newBalance = (parseFloat(wallet.balance) || 0) + amount;
      if (newBalance < 0) throw new Error('Insufficient balance');

      const { error: updateError } = await this.supabase
        .from('wallets')
        .update({ balance: newBalance.toString() })
        .eq('user_id', userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }
} 