import { createClient } from '@supabase/supabase-js';
import debug from 'debug';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const log = debug('setup:users');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function setupTestUsers() {
  try {
    log('🚀 Setting up test users...');

    // Create seller
    const { data: seller, error: sellerError } = await supabase.auth.admin.createUser({
      email: 'seller@trustbank.tech',
      password: 'SecureSellerPass123!',
      email_confirm: true
    });

    if (sellerError) throw sellerError;

    // Create buyer
    const { data: buyer, error: buyerError } = await supabase.auth.admin.createUser({
      email: 'buyer@trustbank.tech',
      password: 'SecureBuyerPass123!',
      email_confirm: true
    });

    if (buyerError) throw buyerError;

    // Create profiles
    const { error: profileError } = await supabase.from('user_profiles').upsert([
      {
        user_id: seller.user.id,
        email: 'seller@trustbank.tech',
        full_name: 'Test Seller',
        quidax_id: process.env.TEST_SELLER_QUIDAX_ID || 'QDX2DWWIOH4'
      },
      {
        user_id: buyer.user.id,
        email: 'buyer@trustbank.tech',
        full_name: 'Test Buyer',
        quidax_id: process.env.TEST_BUYER_QUIDAX_ID || 'QDXZXBTAH6H'
      }
    ]);

    if (profileError) throw profileError;

    log('✅ Test users created successfully:', {
      seller: { id: seller.user.id, email: seller.user.email },
      buyer: { id: buyer.user.id, email: buyer.user.email }
    });

    return {
      seller: seller.user,
      buyer: buyer.user
    };
  } catch (error) {
    log('❌ Error setting up test users:', error);
    throw error;
  }
} 