import { QuidaxClient, QuidaxResponse, QuidaxWallet } from '@/app/lib/services/quidax-client';
import dotenv from 'dotenv';

dotenv.config();

const QUIDAX_API_URL = 'https://www.quidax.com/api/v1';

async function getWalletBalance(userId: string, currency: string): Promise<string> {
  const client = new QuidaxClient(process.env.QUIDAX_SECRET_KEY!);
  try {
    const response = await client.getWallet(userId, currency);
    const wallet = response.data[0];
    return wallet.balance;
  } catch (error) {
    console.error(`Error getting ${currency} balance:`, error);
    throw error;
  }
}

async function testInstantSwap() {
  try {
    const userId = process.env.TEST_USER_ID!;
    const client = new QuidaxClient(process.env.QUIDAX_SECRET_KEY!);

    // Get user's wallets
    console.log('Fetching user wallets...');
    const walletsResponse = await client.fetchUserWallets(userId);
    const wallets = walletsResponse.data;
    
    // Find BTC and USDT wallets
    const btcWallet = wallets.find(w => w.currency === 'btc');
    const usdtWallet = wallets.find(w => w.currency === 'usdt');

    if (!btcWallet || !usdtWallet) {
      throw new Error('BTC or USDT wallet not found');
    }

    console.log('Current balances:');
    console.log(`BTC: ${btcWallet.balance}`);
    console.log(`USDT: ${usdtWallet.balance}`);

    // Get BTC/USDT rate
    console.log('\nGetting BTC/USDT rate...');
    const rate = await client.getRate('btc', 'usdt');
    console.log('BTC/USDT rate:', rate);

    // Create swap quotation
    console.log('\nCreating swap quotation...');
    const quotationResponse = await fetch(
      `${QUIDAX_API_URL}/users/${userId}/swap_quotation`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY!}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          from_currency: 'btc',
          to_currency: 'usdt',
          from_amount: '0.001' // Small test amount
        })
      }
    );

    if (!quotationResponse.ok) {
      throw new Error('Failed to create swap quotation');
    }
    
    const quotationData = await quotationResponse.json();
    console.log('Swap quotation:', quotationData.data);

    // Confirm swap
    console.log('\nConfirming swap...');
    const swapConfirmation = await client.confirmSwapQuotation({
      user_id: userId,
      quotation_id: quotationData.data.id
    });
    console.log('Swap confirmation:', swapConfirmation.data);

    // Get updated balances
    console.log('\nGetting updated balances...');
    const updatedWalletsResponse = await client.fetchUserWallets(userId);
    const updatedWallets = updatedWalletsResponse.data;
    
    const updatedBtcWallet = updatedWallets.find(w => w.currency === 'btc');
    const updatedUsdtWallet = updatedWallets.find(w => w.currency === 'usdt');

    console.log('Updated balances:');
    console.log(`BTC: ${updatedBtcWallet?.balance}`);
    console.log(`USDT: ${updatedUsdtWallet?.balance}`);

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error in instant swap test:', error);
    throw error;
  }
}

// Run the test
testInstantSwap().catch(console.error); 