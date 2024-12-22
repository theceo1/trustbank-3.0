// scripts/execute-trade.ts

import { QuidaxService } from './services/quidax';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('trade:execute');

async function executeTrade() {
  try {
    const adminId = process.env.ADMIN_USER_ID;
    if (!adminId) {
      throw new Error('Admin user ID not configured');
    }

    const swapResult = await QuidaxService.createInstantSwap(adminId, {
      from_currency: 'usdt',
      to_currency: 'usdt',
      from_amount: '10.0' // Amount to transfer
    });

    log('Swap transaction completed:', swapResult);
    return swapResult;
  } catch (error) {
    log('Trade execution failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  executeTrade()
    .then(result => {
      log('Trade completed successfully:', result);
      process.exit(0);
    })
    .catch(error => {
      log('Trade failed:', error);
      process.exit(1);
    });
} 