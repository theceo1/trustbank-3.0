import { getWalletService } from '@/app/lib/services/quidax-wallet';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root directory
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

const log = debug('balance:usdt');

async function checkUSDTBalance(userId: string) {
  try {
    log('🔍 Checking USDT balance for user:', userId);
    const walletService = getWalletService();
    const walletData = await walletService.getWallet(userId, 'usdt');
    
    if (!walletData?.data) {
      throw new Error('Failed to fetch wallet data');
    }

    log('💰 USDT Balance:', {
      balance: walletData.data.balance || '0',
      locked: walletData.data.locked || '0',
      total: (Number(walletData.data.balance || 0) + Number(walletData.data.locked || 0)).toString()
    });

    return walletData.data;
  } catch (error) {
    log('❌ Error checking balance:', error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  // User 1 (sender)
  const senderId = '157fa815-214e-4ecd-8a25-448fe4815ff1';
  // User 2 (receiver)
  const receiverId = '6b642f27-db18-4282-8752-363f590d4fc0';

  Promise.all([
    checkUSDTBalance(senderId),
    checkUSDTBalance(receiverId)
  ])
    .then(([senderWallet, receiverWallet]) => {
      log('✨ Balance check completed');
      log('👤 Sender wallet:', senderWallet);
      log('👥 Receiver wallet:', receiverWallet);
    })
    .catch(error => {
      log('❌ Error:', error);
      process.exit(1);
    });
} 