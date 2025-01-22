import { QuidaxService } from '@/app/lib/services/quidax';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const log = debug('test:crypto-transfer');

interface TestUser {
  quidax_id: string;
  email: string;
  full_name: string;
}

async function testCryptoTransfer(sender: TestUser, receiver: TestUser, amount: string, currency: string = 'usdt') {
  try {
    log('🚀 Starting crypto transfer test...');
    log(`From: ${sender.full_name} (${sender.quidax_id})`);
    log(`To: ${receiver.full_name} (${receiver.quidax_id})`);
    log(`Amount: ${amount} ${currency.toUpperCase()}`);

    // Step 1: Check sender's initial balance
    log('💰 Checking sender initial balance...');
    const senderInitialBalance = await QuidaxService.getWallet(sender.quidax_id, currency);
    if (!senderInitialBalance.data[0]) {
      throw new Error(`No ${currency} wallet found for user ${sender.quidax_id}`);
    }
    const senderBalance = senderInitialBalance.data[0];
    log('Sender initial balance:', {
      currency,
      balance: senderBalance.balance || '0',
      locked: senderBalance.locked || '0',
      pending_debit: senderBalance.pending_debit || '0',
      pending_credit: senderBalance.pending_credit || '0',
      total: senderBalance.total || '0'
    });

    // Step 2: Check receiver's initial balance
    log('💰 Checking receiver initial balance...');
    const receiverInitialBalance = await QuidaxService.getWallet(receiver.quidax_id, currency);
    if (!receiverInitialBalance.data[0]) {
      throw new Error(`No ${currency} wallet found for user ${receiver.quidax_id}`);
    }
    const receiverBalance = receiverInitialBalance.data[0];
    log('Receiver initial balance:', {
      currency,
      balance: receiverBalance.balance || '0',
      locked: receiverBalance.locked || '0',
      pending_debit: receiverBalance.pending_debit || '0',
      pending_credit: receiverBalance.pending_credit || '0',
      total: receiverBalance.total || '0'
    });

    // Step 3: Perform the transfer
    log('💸 Initiating transfer...');
    const transferResponse = await QuidaxService.transfer(
      sender.quidax_id,
      receiver.quidax_id,
      amount,
      currency
    );

    if (transferResponse.status !== 'success') {
      throw new Error(`Transfer failed: ${transferResponse.message || 'Unknown error'}`);
    }

    log('Transfer response:', transferResponse.data);

    // Step 4: Check final balances
    log('💰 Checking final balances...');
    const senderFinalBalance = await QuidaxService.getWallet(sender.quidax_id, currency);
    const receiverFinalBalance = await QuidaxService.getWallet(receiver.quidax_id, currency);

    if (!senderFinalBalance.data[0] || !receiverFinalBalance.data[0]) {
      throw new Error('Failed to fetch final balances');
    }

    const finalSenderBalance = senderFinalBalance.data[0];
    const finalReceiverBalance = receiverFinalBalance.data[0];

    log('Final balances:');
    log('Sender:', {
      currency,
      balance: finalSenderBalance.balance || '0',
      locked: finalSenderBalance.locked || '0',
      pending_debit: finalSenderBalance.pending_debit || '0',
      pending_credit: finalSenderBalance.pending_credit || '0',
      total: finalSenderBalance.total || '0'
    });
    log('Receiver:', {
      currency,
      balance: finalReceiverBalance.balance || '0',
      locked: finalReceiverBalance.locked || '0',
      pending_debit: finalReceiverBalance.pending_debit || '0',
      pending_credit: finalReceiverBalance.pending_credit || '0',
      total: finalReceiverBalance.total || '0'
    });

    return {
      success: true,
      transfer: transferResponse.data,
      balances: {
        sender: {
          initial: senderBalance.balance || '0',
          final: finalSenderBalance.balance || '0'
        },
        receiver: {
          initial: receiverBalance.balance || '0',
          final: finalReceiverBalance.balance || '0'
        }
      }
    };
  } catch (error) {
    log('❌ Error:', error);
    throw error;
  }
}

// Example test users
const testUsers = {
  sender: {
    quidax_id: process.env.TEST_SENDER_QUIDAX_ID || '',
    email: 'sender@test.com',
    full_name: 'Test Sender'
  },
  receiver: {
    quidax_id: process.env.TEST_RECEIVER_QUIDAX_ID || '',
    email: 'receiver@test.com',
    full_name: 'Test Receiver'
  }
};

// Run the test if executed directly
if (require.main === module) {
  if (!testUsers.sender.quidax_id || !testUsers.receiver.quidax_id) {
    console.error('❌ Error: TEST_SENDER_QUIDAX_ID and TEST_RECEIVER_QUIDAX_ID environment variables must be set');
    process.exit(1);
  }

  testCryptoTransfer(testUsers.sender, testUsers.receiver, '1.0')
    .then((result) => {
      console.log('✅ Test completed successfully:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

export { testCryptoTransfer };
export type { TestUser }; 