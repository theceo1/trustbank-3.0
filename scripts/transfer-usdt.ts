import { QuidaxService } from './services/quidax';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('trade:transfer');

async function transferUSDTToAdmin() {
  try {
    // First get admin wallet info to verify it exists
    const adminId = process.env.ADMIN_USER_ID;
    if (!adminId) {
      throw new Error('Admin user ID not configured');
    }

    const adminWallet = await QuidaxService.checkWalletBalance(adminId, 'usdt');
    log('Admin USDT wallet:', adminWallet);

    // Create instant swap to transfer USDT
    const swapResult = await QuidaxService.createInstantSwap(adminId, {
      from_currency: 'usdt',
      to_currency: 'usdt',
      from_amount: '10.0' // Amount to transfer
    });

    log('Swap transaction completed:', swapResult);
    
    // Verify final balance
    const finalBalance = await QuidaxService.checkWalletBalance(adminId, 'usdt');
    log('Final admin USDT balance:', finalBalance);

    return {
      initialBalance: adminWallet.balance,
      transaction: swapResult,
      finalBalance: finalBalance.balance
    };

  } catch (error) {
    log('Transfer failed:', error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  transferUSDTToAdmin()
    .then(result => {
      log('Transfer completed successfully:', result);
      process.exit(0);
    })
    .catch(error => {
      log('Transfer failed:', error);
      process.exit(1);
    });
} 