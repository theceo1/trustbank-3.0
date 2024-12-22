//scripts/test-usdt-transfer.ts
import { TestQuidaxService } from './services/test-quidax';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient, User } from '@supabase/supabase-js';
import { setupTestUsers } from './setup-test-users';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const log = debug('test:transfer');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuthUser extends User {
  email: string;
}

async function testUSDTTransfer() {
  try {
    log('🚀 Starting USDT to NGN transfer test...');

    // First check if users exist in auth with proper typing
    log('🔍 Checking auth users...');
    const { data: { users }, error: authError } = 
      await supabase.auth.admin.listUsers() as { 
        data: { users: AuthUser[] }, 
        error: Error | null 
      };

    if (authError) {
      log('❌ Auth check failed:', authError);
      throw authError;
    }

    const sellerAuth = users.find(u => u.email === 'seller@trustbank.tech');
    const buyerAuth = users.find(u => u.email === 'buyer@trustbank.tech');
    log('📊 Auth users found:', { 
      seller: sellerAuth?.id, 
      buyer: buyerAuth?.id 
    });

    // Check profiles
    log('🔍 Checking user profiles...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('user_id', [sellerAuth?.id, buyerAuth?.id].filter(Boolean));

    if (profileError) {
      log('❌ Profile check failed:', profileError);
      throw profileError;
    }

    log('📊 Found profiles:', profiles?.length || 0);

    // Only setup if either auth users or profiles are missing
    if (!sellerAuth || !buyerAuth || !profiles || profiles.length < 2) {
      log('⚠️ Missing user data, running setup...');
      await setupTestUsers();
      
      // Refresh auth users after setup
      const { data: { users: updatedUsers } } = await supabase.auth.admin.listUsers();
      log('🔄 Updated auth users:', updatedUsers.map(u => ({ id: u.id, email: u.email })));
    }

    // Get test users after potential setup
    log('🔍 Fetching final user profiles...');
    const { data: seller, error: sellerError } = await supabase
      .from('user_profiles')
      .select('user_id, quidax_id')
      .eq('user_id', sellerAuth?.id)
      .single();

    if (sellerError) {
      log('❌ Seller fetch failed:', sellerError);
      throw sellerError;
    }

    const { data: buyer, error: buyerError } = await supabase
      .from('user_profiles')
      .select('user_id, quidax_id')
      .eq('user_id', buyerAuth?.id)
      .single();

    if (buyerError) {
      log('❌ Buyer fetch failed:', buyerError);
      throw buyerError;
    }

    log('✅ Using test users:', {
      seller: { id: seller.user_id, quidax: seller.quidax_id },
      buyer: { id: buyer.user_id, quidax: buyer.quidax_id }
    });

    // Check initial balances with more detail
    log('📊 Checking initial balances...');
    const sellerInitialBalance = await TestQuidaxService.checkWalletBalance(
      seller.quidax_id,
      'usdt'
    );
    const buyerInitialBalance = await TestQuidaxService.checkWalletBalance(
      buyer.quidax_id,
      'ngn'
    );

    log('💰 Initial balances:', {
      seller: {
        usdt: sellerInitialBalance.balance,
        details: sellerInitialBalance
      },
      buyer: {
        ngn: buyerInitialBalance.balance,
        details: buyerInitialBalance
      }
    });

    // Fund seller's USDT wallet first
    log('💰 Funding seller USDT wallet...');
    await TestQuidaxService.fundWallet(seller.quidax_id, 'usdt', '20.0'); // Fund with more than needed

    // Verify funding
    const updatedBalance = await TestQuidaxService.checkWalletBalance(
      seller.quidax_id,
      'usdt'
    );
    log('Updated seller USDT balance:', updatedBalance.balance);

    // Perform transfer with more logging
    const transferAmount = '10.0';
    log(`💸 Initiating swap of ${transferAmount} USDT to NGN...`);

    // Get market rate first
    log('🔍 Checking current market rate...');
    const marketRate = await TestQuidaxService.getMarketStats('usdtngn');
    log('📈 Current market rate:', marketRate);

    // Get temporary quote
    log('📝 Getting temporary quote...');
    const tempQuote = await TestQuidaxService.getTemporaryQuotation({
      user_id: seller.quidax_id,
      from_currency: 'usdt',
      to_currency: 'ngn',
      from_amount: transferAmount
    });
    log('💱 Temporary quote received:', tempQuote);

    // Create quotation
    log('🔄 Creating swap quotation...');
    const quotation = await TestQuidaxService.createSwapQuotation({
      user_id: seller.quidax_id,
      from_currency: 'usdt',
      to_currency: 'ngn',
      from_amount: transferAmount
    });

    log('📋 Quotation details:', {
      id: quotation.id,
      rate: quotation.quoted_price,
      expires_at: quotation.expires_at,
      from: {
        currency: quotation.from_currency,
        amount: quotation.from_amount
      },
      to: {
        currency: quotation.to_currency,
        amount: quotation.to_amount
      }
    });

    // Small delay before confirmation
    log('⏳ Waiting before confirmation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Confirm the quotation
    log('✅ Confirming quotation...', {
      user_id: seller.quidax_id,
      quotation_id: quotation.id,
      timestamp: new Date().toISOString()
    });

    const confirmedSwap = await TestQuidaxService.confirmSwapQuotation({
      user_id: seller.quidax_id,
      quotation_id: quotation.id
    });

    log('🎉 Swap confirmation response:', confirmedSwap);

    // Wait for transaction to settle
    log('⏳ Waiting for transaction to settle...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check final balances
    const sellerFinalBalance = await TestQuidaxService.checkWalletBalance(
      seller.quidax_id,
      'usdt'
    );
    const buyerFinalBalance = await TestQuidaxService.checkWalletBalance(
      buyer.quidax_id,
      'ngn'
    );

    log('📊 Final results:', {
      seller: {
        before: sellerInitialBalance.balance,
        after: sellerFinalBalance.balance,
        change: Number(sellerFinalBalance.balance) - Number(sellerInitialBalance.balance)
      },
      buyer: {
        before: buyerInitialBalance.balance,
        after: buyerFinalBalance.balance,
        change: Number(buyerFinalBalance.balance) - Number(buyerInitialBalance.balance)
      },
      quotation,
      confirmedSwap
    });

    return confirmedSwap;
  } catch (error: any) {
    log('❌ Transfer test failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      endpoint: error.config?.url,
      requestData: error.config?.data,
      headers: error.config?.headers
    });
    throw error;
  }
}

if (require.main === module) {
  testUSDTTransfer()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { testUSDTTransfer }; 