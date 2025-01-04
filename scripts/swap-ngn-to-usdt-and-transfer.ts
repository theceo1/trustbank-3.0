import { QuidaxSwapService } from '../app/lib/services/quidax-swap';
import { getWalletService } from '@/app/lib/services/quidax-wallet';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root directory
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

const log = debug('swap:ngn-usdt-transfer');

// Maximum time to wait for transaction completion (in milliseconds)
const MAX_WAIT_TIME = 60000; // 1 minute
const CHECK_INTERVAL = 5000; // 5 seconds

interface SwapAndTransferConfig {
  // Sender details (User 1)
  senderId: string;
  senderEmail: string;
  senderQuidaxSn: string;
  ngnAmount: string;
  
  // Receiver details (User 2)
  receiverId: string;
  receiverEmail: string;
  receiverQuidaxSn: string;
}

async function waitForTransactionCompletion(userId: string, transactionId: string): Promise<any> {
  const startTime = Date.now();
  let lastStatus = '';

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    const { data: transaction } = await QuidaxSwapService.getSwapTransaction(userId, transactionId);
    
    if (transaction.status !== lastStatus) {
      log('🔄 Transaction status update:', {
        status: transaction.status,
        fromAmount: transaction.from_amount,
        toAmount: transaction.to_amount,
        timestamp: new Date().toISOString()
      });
      lastStatus = transaction.status;
    }

    if (transaction.status === 'completed') {
      return transaction;
    } else if (transaction.status === 'failed' || transaction.status === 'cancelled') {
      throw new Error(`Transaction ${transaction.status}: ${transaction.id}`);
    }

    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }

  throw new Error('Transaction timed out');
}

async function swapNGNToUSDTAndTransfer(config: SwapAndTransferConfig) {
  try {
    log('🚀 Starting NGN to USDT swap and transfer process...');
    log('👤 Sender Details:', {
      userId: config.senderEmail,
      quidaxSn: config.senderQuidaxSn,
      amount: config.ngnAmount
    });
    log('👥 Receiver Details:', {
      userId: config.receiverEmail,
      quidaxSn: config.receiverQuidaxSn
    });

    // 1. Check sender's NGN balance
    log('💰 Checking sender NGN balance...');
    const initialBalanceResponse = await getWalletService().getWallet(
      config.senderId,
      'ngn'
    );

    if (!initialBalanceResponse?.data) {
      throw new Error('Failed to fetch initial NGN balance');
    }
    const initialBalance = initialBalanceResponse.data;

    log('💰 Initial NGN Balance:', {
      balance: initialBalance.balance,
      available: initialBalance.available_balance
    });

    if (Number(initialBalance.balance) < Number(config.ngnAmount)) {
      throw new Error(`Insufficient NGN balance. Required: ${config.ngnAmount}, Available: ${initialBalance.balance}`);
    }

    // 2. Get temporary quote for price estimation
    log('📊 Getting temporary quote...');
    const { data: tempQuote } = await QuidaxSwapService.getTemporaryQuotation({
      user_id: config.senderId,
      from_currency: 'ngn',
      to_currency: 'usdt',
      from_amount: config.ngnAmount
    });

    log('💱 Temporary quote details:', {
      rate: tempQuote.quoted_price,
      fromAmount: tempQuote.from_amount,
      toAmount: tempQuote.to_amount,
      estimatedUSDT: tempQuote.to_amount
    });

    // 3. Create actual swap quotation
    log('🔄 Creating swap quotation...');
    const { data: quotation } = await QuidaxSwapService.createSwapQuotation({
      user_id: config.senderId,
      from_currency: 'ngn',
      to_currency: 'usdt',
      from_amount: config.ngnAmount
    });

    log('📋 Quotation details:', {
      id: quotation.id,
      rate: quotation.quoted_price,
      fromAmount: quotation.from_amount,
      toAmount: quotation.to_amount,
      expiresAt: quotation.expires_at
    });

    // Calculate expiration time
    const expiresAt = new Date(quotation.expires_at).getTime();
    const now = new Date().getTime();
    const timeLeft = Math.floor((expiresAt - now) / 1000);
    log('⏰ Quote expires in:', timeLeft, 'seconds');

    // 4. Confirm the swap
    log('✅ Confirming swap quotation...');
    const confirmedSwap = await QuidaxSwapService.confirmSwap(
      config.senderId,
      quotation.id
    );

    log('🎉 Swap confirmation response:', confirmedSwap);

    // 5. Wait for transaction completion
    log('⏳ Waiting for swap transaction to complete...');
    const completedTransaction = await waitForTransactionCompletion(
      config.senderId,
      confirmedSwap.data.id
    );

    // 6. Check balances after swap
    const finalNGNBalanceResponse = await getWalletService().getWallet(
      config.senderId,
      'ngn'
    );
    const finalUSDTBalanceResponse = await getWalletService().getWallet(
      config.senderId,
      'usdt'
    );

    if (!finalNGNBalanceResponse?.data || !finalUSDTBalanceResponse?.data) {
      throw new Error('Failed to fetch final balances');
    }
    const finalNGNBalance = finalNGNBalanceResponse.data;
    const finalUSDTBalance = finalUSDTBalanceResponse.data;

    log('💰 Final Balances:', {
      ngn: {
        balance: finalNGNBalance.balance,
        change: Number(finalNGNBalance.balance) - Number(initialBalance.balance)
      },
      usdt: {
        balance: finalUSDTBalance.balance
      }
    });

    // 7. Transfer USDT to receiver
    log('🔄 Transferring USDT to receiver...');
    const transferAmount = completedTransaction.received_amount;
    
    const transferResult = await getWalletService().transfer(
      config.senderId,
      config.receiverId,
      transferAmount,
      'usdt'
    );

    if (!transferResult.success) {
      throw new Error('Transfer failed');
    }

    log('🎉 Transfer completed:', {
      reference: transferResult.reference,
      status: transferResult.status
    });

    // 8. Check final balances
    const senderFinalUSDTBalanceResponse = await getWalletService().getWallet(
      config.senderId,
      'usdt'
    );
    const receiverFinalUSDTBalanceResponse = await getWalletService().getWallet(
      config.receiverId,
      'usdt'
    );

    if (!senderFinalUSDTBalanceResponse?.data || !receiverFinalUSDTBalanceResponse?.data) {
      throw new Error('Failed to fetch final USDT balances');
    }
    const senderFinalUSDTBalance = senderFinalUSDTBalanceResponse.data;
    const receiverFinalUSDTBalance = receiverFinalUSDTBalanceResponse.data;

    log('💰 Final USDT Balances:', {
      sender: {
        balance: senderFinalUSDTBalance.balance,
        change: Number(senderFinalUSDTBalance.balance) - Number(finalUSDTBalance.balance)
      },
      receiver: {
        balance: receiverFinalUSDTBalance.balance
      }
    });

    // Return transaction summary
    return {
      success: true,
      data: {
        swap: {
          from_amount: completedTransaction.amount,
          from_currency: 'ngn',
          to_amount: completedTransaction.received_amount,
          to_currency: 'usdt',
          rate: completedTransaction.rate
        },
        transfer: {
          reference: transferResult.reference,
          status: transferResult.status,
          amount: transferAmount
        },
        balances: {
          initial: initialBalance,
          final: {
            sender: {
              ngn: finalNGNBalance,
              usdt: senderFinalUSDTBalance
            },
            receiver: {
              usdt: receiverFinalUSDTBalance
            }
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
  const config: SwapAndTransferConfig = {
    // Sender details (User 1 - has NGN)
    senderId: '157fa815-214e-4ecd-8a25-448fe4815ff1',
    senderEmail: 'test1735848851306@trustbank.tech',
    senderQuidaxSn: 'QDX2DWWIOH4',
    ngnAmount: '932.22', // Using the available NGN balance

    // Receiver details (User 2 - will receive USDT)
    receiverId: '6b642f27-db18-4282-8752-363f590d4fc0',
    receiverEmail: 'receiver1735852152575@trustbank.tech',
    receiverQuidaxSn: 'QDXZXBTAH6H'
  };

  swapNGNToUSDTAndTransfer(config)
    .then(result => {
      log('✨ Swap and transfer completed successfully:', result);
      log('✅ Success:', {
        message: `Successfully swapped ${result.data.swap.from_amount} ${result.data.swap.from_currency} to ${result.data.swap.to_amount} ${result.data.swap.to_currency} and transferred to ${config.receiverEmail}`,
        details: {
          rate: result.data.swap.rate,
          transfer: {
            reference: result.data.transfer.reference,
            status: result.data.transfer.status
          }
        }
      });
    })
    .catch(error => {
      log('❌ Error:', error);
      process.exit(1);
    });
}

export { swapNGNToUSDTAndTransfer }; 