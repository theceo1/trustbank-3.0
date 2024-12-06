import { QuidaxService } from './services/quidax';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('trade:wallet');

async function getAdminWalletInfo() {
  try {
    const adminId = process.env.ADMIN_USER_ID;
    if (!adminId) {
      throw new Error('Admin user ID not configured');
    }

    const walletInfo = await QuidaxService.checkWalletBalance(adminId, 'usdt');
    log('Admin USDT wallet info:', {
      balance: walletInfo.balance,
      depositAddress: walletInfo.deposit_address
    });

    return walletInfo;
  } catch (error) {
    log('Error getting wallet info:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  getAdminWalletInfo()
    .then(result => {
      console.log('Admin Wallet Info:', {
        balance: result.balance,
        depositAddress: result.deposit_address
      });
    })
    .catch(console.error);
} 