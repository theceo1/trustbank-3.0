import { QuidaxClient } from '../app/lib/services/quidax-client';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    console.log('Starting test...');
    const quidaxClient = new QuidaxClient(process.env.QUIDAX_SECRET_KEY);

    // [1] Get user details
    console.log('\n[1] Getting user details...');
    const user = await quidaxClient.getUser();
    console.log('User details:', user);

    // [2] Get user wallets
    console.log('\n[2] Getting user wallets...');
    const wallets = await quidaxClient.fetchUserWallets();
    console.log('User wallets:', wallets.map(w => ({ currency: w.currency, balance: w.balance })));

    // [3] Get USDT/NGN rate
    console.log('\n[3] Getting USDT/NGN rate...');
    const rate = await quidaxClient.getRate('usdt', 'ngn');
    console.log('USDT/NGN rate:', rate);

    // [4] Create swap quotation
    console.log('\n[4] Creating swap quotation...');
    const swapQuotation = await quidaxClient.createSwapQuotation({
      from_currency: 'usdt',
      to_currency: 'ngn',
      from_amount: '0.05',
      user_id: 'me'
    });
    console.log('Swap quotation:', swapQuotation);

    // [5] Confirm swap
    console.log('\n[5] Confirming swap...');
    const swapConfirmation = await quidaxClient.confirmSwapQuotation({
      user_id: 'me',
      quotation_id: swapQuotation.id
    });
    console.log('Swap confirmation:', swapConfirmation);

    // [6] Get updated balances
    console.log('\n[6] Getting updated balances...');
    const updatedWallets = await quidaxClient.fetchUserWallets();
    console.log('Updated wallets:', updatedWallets.map(w => ({ currency: w.currency, balance: w.balance })));

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

main(); 