//scripts/test-trade.ts

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { TestQuidaxService } from './services/test-quidax';

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

async function testTrade() {
  try {
    // First verify parent account
    log('Verifying parent account...');
    const parentAccount = await TestQuidaxService.verifyParentAccount();
    log('Parent account verified:', parentAccount);

    // Continue with rest of test...
    log('Starting trade test...');
    try {
      // Sign in as admin
      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin001@trustbank.tech',
        password: 'SecureAdminPass123!'
      });

      if (signInError) throw signInError;
      log('Admin signed in successfully');

      // Ensure user exists in the database
      await ensureUserExists(supabase, session!.user.id, 'admin001@trustbank.tech');

      // Create Quidax sub-account
      let quidaxUser;
      try {
        quidaxUser = await TestQuidaxService.createSubAccount({
          email: 'admin001@trustbank.tech',
          first_name: 'Admin',
          last_name: 'User'
        });
        log('Created Quidax sub-account:', quidaxUser);
      } catch (error: any) {
        log('Failed to create Quidax sub-account:', error);
        throw error;
      }

      // Store Quidax ID in your database
      try {
        log('Updating user with Quidax ID:', {
          userId: session!.user.id,
          quidaxId: quidaxUser.id
        });
        
        const { data: updateData, error: updateError } = await supabase
          .from('users')
          .update({ 
            quidax_id: quidaxUser.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', session!.user.id)
          .select()
          .single();

        if (updateError) {
          log('Supabase update error:', updateError);
          throw updateError;
        }

        log('Successfully updated user:', updateData);

      } catch (error: any) {
        log('Failed to update user with Quidax ID:', {
          error: error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      // Use the Quidax user ID for subsequent calls
      let quotationResponse;
      try {
        log('Requesting temporary quotation...');
        quotationResponse = await TestQuidaxService.getTemporaryQuotation({
          user_id: quidaxUser.id,
          from_currency: 'ngn',
          to_currency: 'btc',
          from_amount: '1000000'
        });
        log('Got temporary quotation:', quotationResponse);
      } catch (error: any) {
        log('Failed to get temporary quotation:', error);
        throw error;
      }

      // Test with different payment methods
      const paymentMethods = ['card', 'bank_transfer', 'wallet'] as const;

      for (const paymentMethod of paymentMethods) {
        try {
          log(`\n=== Testing with ${paymentMethod} payment ===\n`);
          
          log('Creating instant swap...');
          const instantSwap = await TestQuidaxService.createInstantSwap({
            user_id: quidaxUser.id,
            from_currency: 'ngn',
            to_currency: 'btc',
            from_amount: '1000000',
            payment_method: paymentMethod
          });
          log('Created instant swap:', instantSwap);

          // Add a small delay before confirmation
          log('Waiting before confirmation...');
          await new Promise(resolve => setTimeout(resolve, 2000));

          log('Confirming instant swap...');
          const confirmedSwap = await TestQuidaxService.confirmInstantSwap({
            user_id: quidaxUser.id,
            quotation_id: instantSwap.id,
            payment_method: paymentMethod
          });
          log('Confirmed instant swap:', confirmedSwap);

          // Create test trade record
          const tradeData = {
            user_id: session?.user.id,
            type: 'buy',
            amount: quotationResponse.to_amount,
            currency: 'btc',
            rate: quotationResponse.quoted_price,
            total: quotationResponse.from_amount,
            payment_method: paymentMethod,
            status: 'processing',
            reference: `BUY-${Date.now()}`,
            quidax_reference: confirmedSwap.id,
            created_at: new Date().toISOString()
          };

          log('Creating trade record with data:', tradeData);
          const { data: trade, error: tradeError } = await supabase
            .from('trades')
            .insert(tradeData)
            .select()
            .single();

          if (tradeError) {
            log(`Trade creation error for ${paymentMethod}:`, tradeError);
            continue;
          }

          log(`Test trade created successfully with ${paymentMethod}:`, trade);
        } catch (error: any) {
          log(`Failed to process trade with ${paymentMethod}:`, error);
          continue;
        }
      }

    } catch (error: any) {
      log('Test failed:', {
        error,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      process.exit(1);
    }
  } catch (error: any) {
    log('Test failed:', error);
    throw error;
  }
}

testTrade(); 