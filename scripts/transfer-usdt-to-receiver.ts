import { getWalletService } from '@/app/lib/services/quidax-wallet';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root directory
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

const log = debug('transfer:usdt');

interface TransferConfig {
  // Sender details (User 1)
  senderId: string;
  senderEmail: string;
  senderQuidaxSn: string;
  
  // Receiver details (User 2)
  receiverId: string;
  receiverEmail: string;
  receiverQuidaxSn: string;

  // Transfer details
  amount: string;
}

const MAX_WAIT_TIME = 60000; // 60 seconds
const CHECK_INTERVAL = 2000; // 2 seconds

async function transferUSDT(config: TransferConfig) {
  try {
    log('🚀 Starting USDT transfer process...');
    log('👤 Sender Details:', {
      userId: config.senderEmail,
      quidaxSn: config.senderQuidaxSn
    });
    log('👥 Receiver Details:', {
      userId: config.receiverEmail,
      quidaxSn: config.receiverQuidaxSn
    });

    // 1. Check sender's USDT balance
    log('💰 Checking sender USDT balance...');
    const walletService = getWalletService();
    const senderBalanceResponse = await walletService.getWallet(
      config.senderId,
      'usdt'
    );

    if (!senderBalanceResponse?.data) {
      throw new Error('Failed to fetch sender USDT balance');
    }
    const senderBalance = senderBalanceResponse.data;

    log('💰 Sender USDT Balance:', {
      balance: senderBalance.balance,
      available: senderBalance.available_balance
    });

    if (Number(senderBalance.balance) < Number(config.amount)) {
      throw new Error(`Insufficient USDT balance. Required: ${config.amount}, Available: ${senderBalance.balance}`);
    }

    // 2. Transfer USDT to receiver
    log('🔄 Transferring USDT to receiver...');
    const transferResult = await walletService.transfer(
      config.senderId,
      config.receiverId,
      config.amount,
      'usdt'
    );

    if (!transferResult.success) {
      throw new Error('Transfer failed');
    }

    log('🎉 Transfer initiated:', {
      reference: transferResult.reference,
      status: transferResult.status
    });

    // 3. Wait for transaction completion
    log('⏳ Waiting for transaction to complete...');
    let transactionStatus = await walletService.getTransactionStatus(transferResult.reference);
    let startTime = Date.now();

    while (transactionStatus.status === 'pending' && Date.now() - startTime < MAX_WAIT_TIME) {
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
      transactionStatus = await walletService.getTransactionStatus(transferResult.reference);
      log('🔄 Transaction status:', transactionStatus.status);
    }

    if (transactionStatus.status !== 'completed') {
      throw new Error(`Transaction ${transactionStatus.status}: ${transactionStatus.reference}`);
    }

    // 4. Check final balances
    const senderFinalBalanceResponse = await walletService.getWallet(
      config.senderId,
      'usdt'
    );
    const receiverFinalBalanceResponse = await walletService.getWallet(
      config.receiverId,
      'usdt'
    );

    if (!senderFinalBalanceResponse?.data || !receiverFinalBalanceResponse?.data) {
      throw new Error('Failed to fetch final balances');
    }
    const senderFinalBalance = senderFinalBalanceResponse.data;
    const receiverFinalBalance = receiverFinalBalanceResponse.data;

    log('💰 Final Balances:', {
      sender: {
        balance: senderFinalBalance.balance,
        change: Number(senderFinalBalance.balance) - Number(senderBalance.balance)
      },
      receiver: {
        balance: receiverFinalBalance.balance
      }
    });

    // Return transaction summary
    return {
      success: true,
      data: {
        transfer: {
          reference: transferResult.reference,
          status: transferResult.status,
          amount: config.amount
        },
        balances: {
          initial: {
            sender: senderBalance
          },
          final: {
            sender: senderFinalBalance,
            receiver: receiverFinalBalance
          }
        }
      }
    };
  } catch (error) {
    log('❌ Error:', error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  const config: TransferConfig = {
    // Sender details (User 1 - has USDT)
    senderId: '157fa815-214e-4ecd-8a25-448fe4815ff1',
    senderEmail: 'test1735848851306@trustbank.tech',
    senderQuidaxSn: 'QDX2DWWIOH4',

    // Receiver details (User 2 - will receive USDT)
    receiverId: '6b642f27-db18-4282-8752-363f590d4fc0',
    receiverEmail: 'receiver1735852152575@trustbank.tech',
    receiverQuidaxSn: 'QDXZXBTAH6H',

    // Transfer amount
    amount: '0.5' // Transfer 0.5 USDT
  };

  transferUSDT(config)
    .then(result => {
      log('✨ Transfer completed successfully:', result);
      log('💫 User notification:', {
        title: 'USDT Transfer Completed',
        message: `Successfully transferred ${result.data.transfer.amount} USDT to ${config.receiverEmail}`,
        type: 'success',
        details: {
          reference: result.data.transfer.reference,
          status: result.data.transfer.status,
          debitedWallet: 'USDT',
          creditedWallet: 'USDT'
        }
      });
    })
    .catch(error => {
      log('❌ Error:', error);
      process.exit(1);
    });
} 