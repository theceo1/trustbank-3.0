//scripts/generate-admin-wallet-address.ts

import { QuidaxService } from './services/quidax';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('trade:wallet');

async function generateAdminWalletAddress() {
  try {
    const adminId = 'bf1b9627-f749-4bfc-be9f-9e37254f461d';

    // Check existing wallet info
    const existingWalletInfo = await QuidaxService.checkWalletBalance(adminId, 'usdt');
    if (existingWalletInfo.deposit_address) {
      log('Existing wallet address found:', existingWalletInfo.deposit_address);
      return {
        walletAddress: existingWalletInfo.deposit_address,
        walletInfo: existingWalletInfo
      };
    }

    // Generate new USDT wallet address on TRC20 network
    const walletAddress = await QuidaxService.generateDepositAddress({
      user_id: adminId,
      currency: 'usdt'
    });
    log('Generated wallet address:', walletAddress);

    // Verify wallet info
    const walletInfo = await QuidaxService.checkWalletBalance(adminId, 'usdt');
    log('Wallet info:', walletInfo);

    return {
      walletAddress,
      walletInfo
    };
  } catch (error) {
    log('Error generating wallet address:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateAdminWalletAddress()
    .then(result => {
      console.log('Admin Wallet Details:', result);
    })
    .catch(console.error);
} 