import { QuidaxClient } from '../app/lib/services/quidax-client';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('Starting Quidax integration test...');
    const quidaxClient = new QuidaxClient();

    // Test user creation and wallet setup
    console.log('\n[1] Testing user creation and wallet setup...');
    
    const user = await quidaxClient.getUser();
    console.log('User profile:', {
      quidax_id: user.id,
      is_verified: user.is_verified,
      kyc_status: user.kyc_status
    });

    const wallets = await quidaxClient.fetchUserWallets(user.id);
    console.log('User wallets:', wallets.map(w => ({
      currency: w.currency,
      balance: w.balance
    })));

    // Test getting exchange rate
    console.log('\n[2] Testing exchange rate...');
    const rate = await quidaxClient.getRate('usdt', 'ngn');
    console.log('USDT/NGN rate:', rate);

    // Test creating a new sub-account
    console.log('\n[3] Testing sub-account creation...');
    const subAccount = await quidaxClient.createSubAccount({
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    });
    console.log('Created sub-account:', {
      id: subAccount.id,
      email: subAccount.email,
      kyc_status: subAccount.kyc_status
    });

    // Test transfer
    console.log('\n[4] Testing crypto transfer...');
    const transfer = await quidaxClient.transferCrypto(
      'usdt',
      '10',
      subAccount.id
    );
    console.log('Transfer result:', transfer);

    // Test sub-account wallets
    console.log('\n[5] Testing sub-account wallets...');
    const subAccountWallets = await quidaxClient.fetchUserWallets(subAccount.id);
    console.log('Sub-account wallets:', subAccountWallets.map(w => ({
      currency: w.currency,
      balance: w.balance
    })));

    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main(); 