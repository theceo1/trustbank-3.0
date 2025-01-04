import debug from 'debug';
import dotenv from 'dotenv';
import { QuidaxWalletService } from '../app/lib/services/quidax-wallet';

// Load environment variables
dotenv.config({ path: '.env.local' });

const log = debug('test:trading');

interface TradeConfig {
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
}

async function testTradingFlow(config: TradeConfig) {
  try {
    log('🚀 Starting trading flow test...');
    log('👤 Trade configuration:', config);

    const walletService = new QuidaxWalletService();

    // 1. Check initial balances
    log('💰 Checking initial balances...');
    const fromWalletResponse = await walletService.getWallet(config.userId, config.fromCurrency);
    const toWalletResponse = await walletService.getWallet(config.userId, config.toCurrency);

    if (!fromWalletResponse?.data || !toWalletResponse?.data) {
      throw new Error('Failed to fetch initial wallet balances');
    }
    const fromWallet = fromWalletResponse.data;
    const toWallet = toWalletResponse.data;

    log('💰 Initial Balances:', {
      [config.fromCurrency]: fromWallet.balance,
      [config.toCurrency]: toWallet.balance
    });

    // 2. Get temporary quote
    log('📊 Getting temporary swap quote...');
    const tempQuote = await fetch(
      `${process.env.QUIDAX_API_URL}/users/${config.userId}/temporary_swap_quotation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          from_currency: config.fromCurrency.toLowerCase(),
          to_currency: config.toCurrency.toLowerCase(),
          from_amount: config.amount
        })
      }
    ).then(res => res.json());

    log('Temporary quote received:', tempQuote);

    // 3. Create swap quotation
    log('📝 Creating swap quotation...');
    const quotation = await fetch(
      `${process.env.QUIDAX_API_URL}/users/${config.userId}/swap_quotation`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          from_currency: config.fromCurrency.toLowerCase(),
          to_currency: config.toCurrency.toLowerCase(),
          from_amount: config.amount
        })
      }
    ).then(res => res.json());

    log('Swap quotation created:', quotation);

    // 4. Confirm swap
    log('✅ Confirming swap...');
    const swap = await fetch(
      `${process.env.QUIDAX_API_URL}/users/${config.userId}/swap_quotation/${quotation.data.id}/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
          'Accept': 'application/json'
        }
      }
    ).then(res => res.json());

    log('Swap confirmed:', swap);

    // 5. Monitor swap status
    log('👀 Monitoring swap status...');
    let swapStatus = swap.data.status;
    let retryCount = 0;
    const maxRetries = 10;
    const retryDelay = 2000;

    while (swapStatus !== 'completed' && retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      const status = await fetch(
        `${process.env.QUIDAX_API_URL}/users/${config.userId}/swap_transactions/${swap.data.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
            'Accept': 'application/json'
          }
        }
      ).then(res => res.json());

      swapStatus = status.data.status;
      log('Swap status:', {
        status: swapStatus,
        attempt: retryCount + 1
      });

      retryCount++;
    }

    if (swapStatus !== 'completed') {
      throw new Error('Swap timed out or failed to complete');
    }

    // 6. Check final balances
    log('💰 Checking final balances...');
    const finalFromWalletResponse = await walletService.getWallet(config.userId, config.fromCurrency);
    const finalToWalletResponse = await walletService.getWallet(config.userId, config.toCurrency);

    if (!finalFromWalletResponse?.data || !finalToWalletResponse?.data) {
      throw new Error('Failed to fetch final wallet balances');
    }
    const finalFromWallet = finalFromWalletResponse.data;
    const finalToWallet = finalToWalletResponse.data;

    const summary = {
      [config.fromCurrency]: {
        before: fromWallet.balance,
        after: finalFromWallet.balance,
        change: Number(finalFromWallet.balance) - Number(fromWallet.balance)
      },
      [config.toCurrency]: {
        before: toWallet.balance,
        after: finalToWallet.balance,
        change: Number(finalToWallet.balance) - Number(toWallet.balance)
      },
      swap: {
        id: swap.data.id,
        status: swapStatus,
        fromAmount: config.amount,
        toAmount: swap.data.received_amount,
        executionPrice: swap.data.execution_price
      }
    };

    log('📊 Trade summary:', summary);

    return {
      success: true,
      summary
    };

  } catch (error) {
    log('❌ Error in trading flow:', error);
    throw error;
  }
}

// Test configuration
const testConfig: TradeConfig = {
  userId: process.env.TEST_USER_ID || '',
  fromCurrency: 'NGN',
  toCurrency: 'USDT',
  amount: '1000'
};

// Run the test
testTradingFlow(testConfig)
  .then(result => {
    log('🎉 Trading flow test completed successfully:', result);
    process.exit(0);
  })
  .catch(error => {
    log('❌ Trading flow test failed:', error);
    process.exit(1);
  }); 