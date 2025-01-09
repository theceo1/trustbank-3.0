import { QuidaxClient } from '../app/lib/services/quidax-client';
import { QuidaxUser, QuidaxWallet } from '../app/types/quidax';
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

    // [1] Get user details
    console.log('\n[1] Getting user details...');
    const userResponse = await fetch(
      `${QUIDAX_API_URL}/users/${TEST_USER_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user details');
    }
    
    const userData = await userResponse.json();
    if (!userData?.data) {
      throw new Error('Invalid user data received');
    }
    console.log('User details:', userData.data);

    // [2] Get user wallets
    console.log('\n[2] Getting user wallets...');
    const walletsResponse = await quidaxClient.fetchUserWallets(TEST_USER_ID);
    if (!walletsResponse?.data) {
      throw new Error('Failed to fetch user wallets');
    }
    console.log('User wallets:', walletsResponse.data.map((w: QuidaxWallet) => ({ 
      currency: w.currency, 
      balance: w.balance 
    })));

    // [3] Get USDT/NGN rate
    console.log('\n[3] Getting USDT/NGN rate...');
    const rate = await quidaxClient.getRate('usdt', 'ngn');
    console.log('USDT/NGN rate:', rate);

    // [4] Create swap quotation
    console.log('\n[4] Creating swap quotation...');
    const quotationResponse = await fetch(
      `${QUIDAX_API_URL}/users/${TEST_USER_ID}/swap_quotation`,
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
          from_amount: '0.05'
        })
      }
    );
    
    if (!quotationResponse.ok) {
      throw new Error('Failed to create swap quotation');
    }
    
    const quotationData = await quotationResponse.json();
    if (!quotationData?.data) {
      throw new Error('Invalid quotation data received');
    }
    console.log('Swap quotation:', quotationData.data);

    // [5] Confirm swap
    console.log('\n[5] Confirming swap...');
    const swapConfirmation = await quidaxClient.confirmSwapQuotation({
      user_id: TEST_USER_ID,
      quotation_id: quotationData.data.id
    });
    if (!swapConfirmation?.data) {
      throw new Error('Failed to confirm swap');
    }
    console.log('Swap confirmation:', swapConfirmation.data);

    // [6] Get updated balances
    console.log('\n[6] Getting updated balances...');
    const updatedWalletsResponse = await quidaxClient.fetchUserWallets(TEST_USER_ID);
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