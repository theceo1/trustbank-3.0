import { QuidaxClient, QuidaxResponse, QuidaxWallet } from '@/app/lib/services/quidax-client';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Constants
const TEST_USER_ID = '157fa815-214e-4ecd-8a25-448fe4815ff1';
const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

async function main() {
  try {
    console.log('Starting test...');
    const apiKey = process.env.QUIDAX_SECRET_KEY;
    if (!apiKey) {
      throw new Error('QUIDAX_SECRET_KEY is not set in environment variables');
    }
    const quidaxClient = new QuidaxClient(apiKey);

    // Get user wallets
    console.log('\nGetting user wallets...');
    const walletsResponse = await quidaxClient.fetchUserWallets('me');
    if (!walletsResponse?.data) {
      throw new Error('Failed to fetch user wallets');
    }
    console.log('User wallets:', walletsResponse.data.map((w: QuidaxWallet) => ({
      currency: w.currency,
      balance: w.balance
    })));

    // Get updated balances
    console.log('\nGetting updated balances...');
    const updatedWalletsResponse = await quidaxClient.fetchUserWallets('me');
    if (!updatedWalletsResponse?.data) {
      throw new Error('Failed to fetch updated wallets');
    }
    console.log('Updated wallets:', updatedWalletsResponse.data.map((w: QuidaxWallet) => ({
      currency: w.currency,
      balance: w.balance
    })));

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main(); 