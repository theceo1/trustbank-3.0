//scripts/test-trade-flow.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { QuidaxService } from './services/quidax';

const log = debug('test:trade');
debug.enable('test:*');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testTradeFlow() {
  try {
    log('🚀 Starting minimal trade flow test...');

    // Get test users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, quidax_id')
      .in('email', ['user2@trustbank.tech', 'user3@trustbank.tech']);

    if (userError || !users || users.length !== 2) {
      throw new Error('Failed to fetch test users');
    }

    const user2 = users.find(u => u.email === 'user2@trustbank.tech');
    const user3 = users.find(u => u.email === 'user3@trustbank.tech');

    if (!user2 || !user3) {
      throw new Error('Could not find both test users');
    }

    // Test with minimal amount
    const USDT_AMOUNT = '10'; // Just 10 USDT for testing

    // Check initial balances
    log('📊 Checking initial balances...');
    const user3Balance = await QuidaxService.checkWalletBalance(
      user3.quidax_id,
      'usdt'
    );
    log('User3 USDT Balance:', user3Balance);

    // Get market rate for reference
    log('📊 Checking current market rate...');
    const marketRate = await QuidaxService.getMarketStats('usdtngn');
    log('Current USDT/NGN rate:', marketRate);

    // Create swap quotation
    log(`💱 Creating swap quotation for ${USDT_AMOUNT} USDT...`);
    const quotation = await QuidaxService.createSwapQuotation({
      user_id: user3.quidax_id,
      from_currency: 'usdt',
      to_currency: 'ngn',
      from_amount: USDT_AMOUNT
    });

    // Small delay before confirmation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Confirm the swap
    log('🔄 Confirming swap...');
    const confirmedSwap = await QuidaxService.confirmSwapQuotation({
      user_id: user3.quidax_id,
      quotation_id: quotation.id
    });

    // Check final balances
    const user3FinalBalance = await QuidaxService.checkWalletBalance(
      user3.quidax_id,
      'usdt'
    );

    log('✅ Trade completed:', {
      from: `${USDT_AMOUNT} USDT`,
      to: `${confirmedSwap.to_amount} NGN`,
      rate: quotation.quoted_price,
      initial_balance: user3Balance.balance,
      final_balance: user3FinalBalance.balance
    });

  } catch (error: any) {
    log('❌ Trade test failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
  }
}

testTradeFlow(); 