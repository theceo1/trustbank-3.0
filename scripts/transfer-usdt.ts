import { QuidaxService } from '../scripts/services/quidax';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('transfer:usdt');

async function transferUSDT(
  fromUserId: string,
  toUserId: string,
  amount: string
) {
  try {
    log('🚀 Starting USDT transfer...');

    // Check sender's balance
    log('💰 Checking sender balance...');
    const senderBalance = await QuidaxService.getWalletBalance(fromUserId, 'usdt');

    if (!senderBalance?.data?.[0]) {
      throw new Error('Failed to fetch sender balance');
    }

    // Create swap quotation
    log('📝 Creating swap quotation...');
    const quotation = await QuidaxService.createSwapQuotation({
      user_id: fromUserId,
      from_currency: 'usdt',
      to_currency: 'usdt',
      from_amount: amount
    });

    // Check receiver's balance
    log('💰 Checking receiver balance...');
    const receiverBalance = await QuidaxService.getWalletBalance(toUserId, 'usdt');

    if (!receiverBalance?.data?.[0]) {
      throw new Error('Failed to fetch receiver balance');
    }

    // Perform transfer
    log('💸 Transferring USDT...');
    const transfer = await QuidaxService.transfer(
      fromUserId,
      toUserId,
      amount,
      'usdt'
    );

    if (!transfer.success) {
      throw new Error('Transfer failed');
    }

    log('✅ Transfer successful:', {
      reference: transfer.reference,
      status: transfer.status
    });

    return transfer;
  } catch (error) {
    log('❌ Error:', error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  const fromUserId = process.env.TEST_USER_ID || '';
  const toUserId = process.env.ADMIN_USER_ID || '';
  const amount = '0.1';

  if (!fromUserId || !toUserId) {
    console.error('Missing user IDs in environment variables');
    process.exit(1);
  }

  transferUSDT(fromUserId, toUserId, amount)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { transferUSDT }; 