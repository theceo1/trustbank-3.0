//scripts/test-trade.ts

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { QuidaxService } from '../scripts/services/quidax';
import axios from 'axios';

const log = debug('trade:test');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

log('Environment check:', {
  QUIDAX_API_URL: process.env.QUIDAX_API_URL,
  QUIDAX_SECRET_KEY: process.env.QUIDAX_SECRET_KEY ? 'set' : 'not set',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set',
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function ensureUserExists(supabase: any, userId: string, email: string) {
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // Not found error
    throw fetchError;
  }

  if (!existingUser) {
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        first_name: 'Admin',
        last_name: 'User'
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newUser;
  }

  return existingUser;
}

// Define the payment method type
type PaymentMethod = 'card' | 'bank_transfer' | 'wallet';

// Add new type for trade direction
type TradeDirection = 'buy' | 'sell';

// Add test configuration
const TEST_CONFIG = {
  mode: 'live', // 'mock' or 'live'
  mockSupabase: false, // Set to true if you want to mock Supabase calls
  logLevel: 'debug' // 'debug' or 'info'
};

// Change TEST_MODE to false for real API calls
const TEST_MODE = false;

// Change amount to 1 USDT
const TRADE_AMOUNT = '1';

// Add constant for the known Quidax account with balance
const QUIDAX_ACCOUNT_ID = 'eb8f4741-c8f3-4e67-9e74-351a1f26dd74';

async function testTrade(direction: TradeDirection = 'sell') {
  try {
    log('Starting live trade test for USDT sell...');
    
    // First verify parent account
    log('Verifying parent account...');
    const parentAccount = await QuidaxService.verifyParentAccount();
    log('Parent account verified:', parentAccount);

    // Sign in as admin
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin001@trustbank.tech',
      password: 'SecureAdminPass123!'
    });

    if (signInError) throw signInError;
    log('Admin signed in successfully');

    // Ensure user exists in the database
    await ensureUserExists(supabase, session!.user.id, 'admin001@trustbank.tech');

    // Use the known Quidax account ID
    let quidaxUser;
    try {
      const response = await axios.get(
        `${process.env.QUIDAX_API_URL}/users/${QUIDAX_ACCOUNT_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      quidaxUser = response.data.data;
      log('Retrieved Quidax account:', quidaxUser);
    } catch (error: any) {
      log('Failed to get Quidax account:', error);
      throw error;
    }

    // Update user with Quidax ID if needed
    try {
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ 
          quidax_id: QUIDAX_ACCOUNT_ID,
          updated_at: new Date().toISOString()
        })
        .eq('id', session!.user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      log('Successfully updated user:', updateData);
    } catch (error: any) {
      log('Failed to update user with Quidax ID:', error);
      throw error;
    }

    // Check USDT balance and get wallet info
    log('Checking USDT wallet...');
    const walletInfo = await QuidaxService.checkWalletBalance(QUIDAX_ACCOUNT_ID, 'usdt');
    log('Wallet info:', walletInfo);

    const currentBalance = parseFloat(walletInfo.balance);
    log('Current USDT balance:', currentBalance);

    // Set trade amount based on available balance (slightly less than total to account for fees)
    const TRADE_AMOUNT = '0.3';

    if (currentBalance < parseFloat(TRADE_AMOUNT)) {
      throw new Error(`Insufficient USDT balance. Current balance: ${currentBalance} USDT. Required: ${TRADE_AMOUNT} USDT.`);
    }

    // Create swap quotation
    log('Creating swap quotation...');
    const swapQuotationResponse = await QuidaxService.createSwapQuotation(
      QUIDAX_ACCOUNT_ID,
      {
        from_currency: 'usdt',
        to_currency: 'ngn',
        from_amount: TRADE_AMOUNT
      }
    );
    log('Swap quotation response:', JSON.stringify(swapQuotationResponse, null, 2));

    // Add a shorter delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Confirm swap quotation
    log('Confirming swap quotation...');
    log('User ID:', QUIDAX_ACCOUNT_ID);
    log('Quotation ID:', swapQuotationResponse.id);
    
    const confirmedSwap = await QuidaxService.confirmSwapQuotation(
      QUIDAX_ACCOUNT_ID,
      swapQuotationResponse.id
    );
    log('Swap confirmation response:', JSON.stringify(confirmedSwap, null, 2));

    // Create trade record
    const tradeData = {
      user_id: session?.user.id,
      type: 'sell',
      amount: TRADE_AMOUNT,
      currency: 'USDT',
      rate: swapQuotationResponse.quoted_price,
      total: swapQuotationResponse.to_amount,
      payment_method: 'wallet',
      status: 'completed',
      reference: `SELL-USDT-${Date.now()}`,
      quidax_reference: confirmedSwap.id,
      created_at: new Date().toISOString()
    };

    log('Creating trade record:', tradeData);
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert(tradeData)
      .select()
      .single();

    if (tradeError) throw tradeError;
    log('Trade record created:', trade);

    return trade;

  } catch (error: any) {
    log('Test failed. Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

async function checkTransactionStatus(quidaxReference: string, interval: number = 5000, maxAttempts: number = 20) {
  let attempts = 0;
  let transactionStatus = 'pending';

  while (transactionStatus === 'pending' && attempts < maxAttempts) {
    try {
      log(`Checking transaction status for reference: ${quidaxReference} (Attempt ${attempts + 1})`);
      
      const response = await axios.get(
        `${process.env.QUIDAX_API_URL}/users/me/swap_transactions/${quidaxReference}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const transaction = response.data?.data;
      transactionStatus = transaction?.status || 'pending';
      log('Current transaction status:', transactionStatus);

      if (transactionStatus === 'completed') {
        log('Transaction completed successfully:', transaction);
        return transaction;
      }

    } catch (error: any) {
      log('Error checking transaction status:', error.response?.data || error);
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  if (transactionStatus !== 'completed') {
    throw new Error('Transaction did not complete within the expected time frame.');
  }
}

// Run the test and check transaction status
testTrade('sell')
  .then(async (trade) => {
    log('Test completed successfully, checking transaction status...');
    await checkTransactionStatus(trade.quidax_reference);
    log('Transaction status check completed.');
    process.exit(0);
  })
  .catch((error) => {
    log('Test failed:', error.response?.data || error);
    process.exit(1);
  }); 