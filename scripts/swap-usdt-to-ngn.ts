import { QuidaxSwapService } from '../app/lib/services/quidax-swap';
import { getWalletService } from '@/app/lib/services/quidax-wallet';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from the root directory
const envPath = resolve(process.cwd(), '.env.local');
console.log('Loading environment from:', envPath);
dotenv.config({ path: envPath });

const log = debug('swap:usdt-ngn');

// Maximum time to wait for transaction completion (in milliseconds)
const MAX_WAIT_TIME = 60000; // 1 minute
const CHECK_INTERVAL = 5000; // 5 seconds

interface SwapConfig {
  userId: string;
  quidaxId: string;
  quidaxSn: string;
  amount: string;
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

async function swapUSDTToNGN(config: SwapConfig) {
  try {
    log('🚀 Starting USDT to NGN swap process...');
    log('👤 User Details:', {
      userId: config.userId,
      quidaxSn: config.quidaxSn,
      amount: config.amount
    });

    // 1. Check initial balance
    log('💰 Checking initial USDT balance...');
    const initialBalanceResponse = await getWalletService().getWallet(
      config.quidaxId,
      'usdt'
    );

    if (!initialBalanceResponse?.data?.length) {
      throw new Error('No USDT wallet found');
    }

    const initialBalance = initialBalanceResponse.data[0];
    if (!initialBalance || typeof initialBalance.balance === 'undefined') {
      throw new Error('Invalid USDT wallet data');
    }

    log('💰 Initial USDT Balance:', {
      balance: initialBalance.balance || '0',
      pending_debit: initialBalance.pending_debit || '0',
      pending_credit: initialBalance.pending_credit || '0',
      total: initialBalance.total || '0'
    });

    if (Number(initialBalance.balance) < Number(config.amount)) {
      throw new Error(`Insufficient USDT balance. Required: ${config.amount}, Available: ${initialBalance.balance}`);
    }

    // 2. Get temporary quote for price estimation
    log('📊 Getting temporary quote...');
    const { data: tempQuote } = await QuidaxSwapService.getTemporaryQuotation({
      user_id: config.quidaxId,
      from_currency: 'usdt',
      to_currency: 'ngn',
      from_amount: config.amount
    });

    log('💱 Temporary quote details:', {
      rate: tempQuote.quoted_price,
      fromAmount: tempQuote.from_amount,
      toAmount: tempQuote.to_amount,
      estimatedNGN: tempQuote.to_amount
    });

    // 3. Create actual swap quotation
    log('🔄 Creating swap quotation...');
    const { data: quotation } = await QuidaxSwapService.createSwapQuotation({
      user_id: config.quidaxId,
      from_currency: 'usdt',
      to_currency: 'ngn',
      from_amount: config.amount
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
      config.quidaxId,
      quotation.id
    );

    log('🎉 Swap confirmation response:', confirmedSwap);

    // 5. Wait for transaction completion
    log('⏳ Waiting for transaction to complete...');
    const completedTransaction = await waitForTransactionCompletion(
      config.quidaxId,
      confirmedSwap.data.id
    );

    // 6. Check final balances
    const finalUSDTBalanceResponse = await getWalletService().getWallet(
      config.quidaxId,
      'usdt'
    );
    const finalNGNBalanceResponse = await getWalletService().getWallet(
      config.quidaxId,
      'ngn'
    );

    if (!finalUSDTBalanceResponse?.data?.length || !finalNGNBalanceResponse?.data?.length) {
      throw new Error('Failed to fetch final balances');
    }
    const finalUSDTBalance = finalUSDTBalanceResponse.data[0];
    const finalNGNBalance = finalNGNBalanceResponse.data[0];

    log('💰 Final Balances:', {
      usdt: {
        balance: finalUSDTBalance.balance,
        change: Number(finalUSDTBalance.balance) - Number(initialBalance.balance)
      },
      ngn: {
        balance: finalNGNBalance.balance
      }
    });

    const summary = {
      usdt: {
        before: initialBalance.balance,
        after: finalUSDTBalance.balance,
        change: Number(finalUSDTBalance.balance) - Number(initialBalance.balance)
      },
      ngn: {
        before: '0.0', // We don't have the initial NGN balance
        after: finalNGNBalance.balance,
        change: Number(finalNGNBalance.balance)
      },
      rate: quotation.quoted_price,
      timestamp: new Date().toISOString()
    };

    log('📊 Final balances:', summary);

    // 7. Create transaction history record
    const transactionRecord = {
      user_id: config.userId,
      quidax_id: config.quidaxId,
      transaction_id: completedTransaction.id,
      type: 'swap',
      from_currency: 'USDT',
      to_currency: 'NGN',
      from_amount: config.amount,
      to_amount: completedTransaction.to_amount || completedTransaction.received_amount,
      rate: quotation.quoted_price,
      status: completedTransaction.status,
      created_at: completedTransaction.created_at,
      completed_at: new Date().toISOString()
    };

    log('📝 Transaction record:', transactionRecord);

    return {
      success: true,
      data: {
        swap: {
          from_amount: completedTransaction.amount,
          from_currency: 'usdt',
          to_amount: completedTransaction.received_amount,
          to_currency: 'ngn',
          rate: completedTransaction.rate
        },
        balances: {
          initial: initialBalance,
          final: {
            usdt: finalUSDTBalance,
            ngn: finalNGNBalance
          }
        }
      }
    };

  } catch (error: any) {
    log('❌ Swap failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      endpoint: error.config?.url,
      requestData: error.config?.data
    });
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  const config: SwapConfig = {
    userId: 'test1735848851306@trustbank.tech',
    quidaxId: '157fa815-214e-4ecd-8a25-448fe4815ff1',
    quidaxSn: 'QDX2DWWIOH4',
    amount: '0.01' // Amount of USDT to swap (reduced to match current available balance)
  };

  swapUSDTToNGN(config)
    .then(result => {
      log('✨ Swap completed successfully:', result);
      log('✅ Success:', {
        message: `Successfully swapped ${result.data.swap.from_amount} ${result.data.swap.from_currency} to ${result.data.swap.to_amount} ${result.data.swap.to_currency}`,
        details: {
          rate: result.data.swap.rate,
          balances: {
            usdt: result.data.balances.final.usdt.balance,
            ngn: result.data.balances.final.ngn.balance
          }
        }
      });
      process.exit(0);
    })
    .catch(error => {
      log('❌ Error:', error);
      process.exit(1);
    });
}

export { swapUSDTToNGN }; 