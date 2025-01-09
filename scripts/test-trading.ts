import { getWalletService } from '../app/lib/services/quidax-wallet';
import { QuidaxSwapService } from '../app/lib/services/quidax-swap';
import debug from 'debug';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const log = debug('test:trading');

interface TradeConfig {
  userId: string;
  quidaxId: string;
  quidaxSn: string;
  amount: string;
  fromCurrency: string;
  toCurrency: string;
}

async function testTrading(config: TradeConfig) {
  try {
    log('🚀 Starting trading test...');
    log('👤 Trade configuration:', config);

    const walletService = getWalletService();

    // 1. Check initial balances
    log('💰 Checking initial balances...');
    const fromBalanceResponse = await walletService.getWallet(
      config.quidaxId,
      config.fromCurrency
    );
    const toBalanceResponse = await walletService.getWallet(
      config.quidaxId,
      config.toCurrency
    );

    if (!fromBalanceResponse?.data?.length || !toBalanceResponse?.data?.length) {
      throw new Error('Failed to fetch initial balances');
    }

    const fromWallet = fromBalanceResponse.data[0];
    const toWallet = toBalanceResponse.data[0];

    log('💰 Initial Balances:', {
      [config.fromCurrency]: {
        balance: fromWallet.balance,
        pending: fromWallet.pending_balance,
        total: fromWallet.total_balance
      },
      [config.toCurrency]: {
        balance: toWallet.balance,
        pending: toWallet.pending_balance,
        total: toWallet.total_balance
      }
    });

    // 2. Get temporary quote for price estimation
    log('📊 Getting temporary quote...');
    const { data: tempQuote } = await QuidaxSwapService.getTemporaryQuotation({
      user_id: config.quidaxId,
      from_currency: config.fromCurrency,
      to_currency: config.toCurrency,
      from_amount: config.amount
    });

    log('💱 Temporary quote details:', {
      rate: tempQuote.quoted_price,
      fromAmount: tempQuote.from_amount,
      toAmount: tempQuote.to_amount,
      estimatedAmount: tempQuote.to_amount
    });

    // 3. Create actual swap quotation
    log('🔄 Creating swap quotation...');
    const { data: quotation } = await QuidaxSwapService.createSwapQuotation({
      user_id: config.quidaxId,
      from_currency: config.fromCurrency,
      to_currency: config.toCurrency,
      from_amount: config.amount
    });

    log('📋 Quotation details:', {
      id: quotation.id,
      rate: quotation.quoted_price,
      fromAmount: quotation.from_amount,
      toAmount: quotation.to_amount,
      expiresAt: quotation.expires_at
    });

    // 4. Confirm the swap
    log('✅ Confirming swap quotation...');
    const confirmedSwap = await QuidaxSwapService.confirmSwap(
      config.quidaxId,
      quotation.id
    );

    log('🎉 Swap confirmation response:', confirmedSwap);

    // 5. Check final balances
    log('💰 Checking final balances...');
    const finalFromBalanceResponse = await walletService.getWallet(
      config.quidaxId,
      config.fromCurrency
    );
    const finalToBalanceResponse = await walletService.getWallet(
      config.quidaxId,
      config.toCurrency
    );

    if (!finalFromBalanceResponse?.data?.length || !finalToBalanceResponse?.data?.length) {
      throw new Error('Failed to fetch final balances');
    }

    const finalFromWallet = finalFromBalanceResponse.data[0];
    const finalToWallet = finalToBalanceResponse.data[0];

    log('💰 Final Balances:', {
      [config.fromCurrency]: {
        balance: finalFromWallet.balance,
        pending: finalFromWallet.pending_balance,
        total: finalFromWallet.total_balance,
        change: Number(finalFromWallet.balance) - Number(fromWallet.balance)
      },
      [config.toCurrency]: {
        balance: finalToWallet.balance,
        pending: finalToWallet.pending_balance,
        total: finalToWallet.total_balance,
        change: Number(finalToWallet.balance) - Number(toWallet.balance)
      }
    });

    return {
      success: true,
      data: {
        swap: {
          from_amount: quotation.from_amount,
          from_currency: config.fromCurrency,
          to_amount: quotation.to_amount,
          to_currency: config.toCurrency,
          rate: quotation.quoted_price
        },
        balances: {
          initial: {
            [config.fromCurrency]: fromWallet,
            [config.toCurrency]: toWallet
          },
          final: {
            [config.fromCurrency]: finalFromWallet,
            [config.toCurrency]: finalToWallet
          }
        }
      }
    };

  } catch (error) {
    log('❌ Error:', error);
    throw error;
  }
}

// Run the test if executed directly
if (require.main === module) {
  const testConfig: TradeConfig = {
    userId: 'test1735848851306@trustbank.tech',
    quidaxId: '157fa815-214e-4ecd-8a25-448fe4815ff1',
    quidaxSn: 'QDX2DWWIOH4',
    amount: '0.01',
    fromCurrency: 'usdt',
    toCurrency: 'ngn'
  };

  testTrading(testConfig)
    .then(result => {
      log('🎉 Trading test completed successfully:', result);
      process.exit(0);
    })
    .catch(error => {
      log('❌ Trading test failed:', error);
      process.exit(1);
    });
}

export { testTrading }; 