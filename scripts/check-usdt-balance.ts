import debug from 'debug';
import { QuidaxService } from '../app/lib/services/quidax';

const log = debug('balance:usdt');

async function main() {
  try {
    const userId = process.env.QUIDAX_USER_ID;
    if (!userId) {
      throw new Error('QUIDAX_USER_ID is required');
    }

    log('🔍 Checking USDT balance for user:', userId);

    const walletData = await QuidaxService.getWalletBalance(userId, 'usdt');
    if (!walletData?.data?.length) {
      throw new Error('No wallet data found');
    }

    const wallet = walletData.data[0];
    if (!wallet) {
      throw new Error('No USDT wallet found');
    }

    log('💰 USDT Balance:', {
      balance: wallet.balance || '0',
      pending: wallet.pending_balance || '0',
      total: wallet.total_balance || '0'
    });

  } catch (error) {
    log('❌ Error:', error);
    process.exit(1);
  }
}

main(); 