import { QuidaxClient } from '../app/lib/services/quidax-client';
import { QuidaxWallet } from '../app/types/quidax';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Constants
const TEST_USER_ID = '157fa815-214e-4ecd-8a25-448fe4815ff1';
const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

async function main() {
  try {
    console.log('Starting Quidax integration test...');
    const apiKey = process.env.QUIDAX_SECRET_KEY;
    if (!apiKey) {
      throw new Error('QUIDAX_SECRET_KEY is not set in environment variables');
    }
    const quidaxClient = new QuidaxClient(apiKey);

    // Test user creation and wallet setup
    console.log('\n[1] Testing user creation and wallet setup...');
    const user = await quidaxClient.createSubAccount({
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    });
    console.log('Created user:', user);

    // Test wallet fetching
    console.log('\n[2] Testing wallet fetching...');
    const wallets = await quidaxClient.fetchUserWallets(TEST_USER_ID);
    console.log('User wallets:', wallets.data?.map((w: QuidaxWallet) => ({
      currency: w.currency,
      balance: w.balance
    })));

    // Test market data
    console.log('\n[3] Testing market data...');
    const rate = await quidaxClient.getRate('usdt', 'ngn');
    console.log('USDT/NGN rate:', rate);

    // Test swap quotation
    console.log('\n[4] Testing swap quotation...');
    const swapResponse = await fetch(
      `${QUIDAX_API_URL}/swaps/quote`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          from_currency: 'usdt',
          to_currency: 'ngn',
          from_amount: '0.05',
          user_id: TEST_USER_ID
        })
      }
    );
    const swapData = await swapResponse.json();
    console.log('Swap quotation:', swapData);

    // Test final wallet balances
    console.log('\n[5] Testing final balances...');
    const finalWallets = await quidaxClient.fetchUserWallets(TEST_USER_ID);
    console.log('Final wallet balances:', finalWallets.data?.map((w: QuidaxWallet) => ({
      currency: w.currency,
      balance: w.balance
    })));

    console.log('\nIntegration test completed successfully!');
  } catch (error) {
    console.error('Integration test failed:', error);
    process.exit(1);
  }
}

main(); 