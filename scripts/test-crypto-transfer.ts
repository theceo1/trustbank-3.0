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
    const senderInitialBalance = await QuidaxService.getWalletBalance(sender.quidax_id, currency);
    if (!senderInitialBalance.ok) {
      throw new Error('Failed to fetch sender initial balance');
    }
    const senderBalance = await senderInitialBalance.json();
    log(`Sender initial balance: ${senderBalance.data[0]?.balance || '0'} ${currency.toUpperCase()}`);

    // Step 2: Check receiver's initial balance
    log('💰 Checking receiver initial balance...');
    const receiverInitialBalance = await QuidaxService.getWalletBalance(receiver.quidax_id, currency);
    if (!receiverInitialBalance.ok) {
      throw new Error('Failed to fetch receiver initial balance');
    }
    const receiverBalance = await receiverInitialBalance.json();
    log(`Receiver initial balance: ${receiverBalance.data[0]?.balance || '0'} ${currency.toUpperCase()}`);

    // Step 3: Perform the transfer
    log('💸 Initiating transfer...');
    const transferResponse = await QuidaxService.transfer(
      sender.quidax_id,
      receiver.quidax_id,
      amount,
      currency
    );

    if (!transferResponse.ok) {
      const error = await transferResponse.json();
      throw new Error(`Transfer failed: ${error.message || 'Unknown error'}`);
    }

    const transfer = await transferResponse.json();
    log('Transfer response:', transfer);

    // Step 4: Check final balances
    log('💰 Checking final balances...');
    const senderFinalBalance = await QuidaxService.getWalletBalance(sender.quidax_id, currency);
    const receiverFinalBalance = await QuidaxService.getWalletBalance(receiver.quidax_id, currency);

    if (!senderFinalBalance.ok || !receiverFinalBalance.ok) {
      throw new Error('Failed to fetch final balances');
    }

    const finalSenderBalance = await senderFinalBalance.json();
    const finalReceiverBalance = await receiverFinalBalance.json();

    log('Final balances:');
    log(`Sender: ${finalSenderBalance.data[0]?.balance || '0'} ${currency.toUpperCase()}`);
    log(`Receiver: ${finalReceiverBalance.data[0]?.balance || '0'} ${currency.toUpperCase()}`);

    return {
      success: true,
      transfer: transfer.data,
      balances: {
        sender: {
          initial: senderBalance.data[0]?.balance || '0',
          final: finalSenderBalance.data[0]?.balance || '0'
        },
        receiver: {
          initial: receiverBalance.data[0]?.balance || '0',
          final: finalReceiverBalance.data[0]?.balance || '0'
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

export { testCryptoTransfer, TestUser }; 