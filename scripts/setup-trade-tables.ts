import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('setup:trade-tables');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupTradeTables() {
  let client;
  try {
    log('Creating trade-related tables...');
    client = await pool.connect();

    // Drop existing tables to avoid conflicts
    await client.query(`
      DROP TABLE IF EXISTS public.wallets CASCADE;
      DROP TABLE IF EXISTS public.user_profiles CASCADE;
      DROP TABLE IF EXISTS public.users CASCADE;
    `);
    log('✓ Existing tables dropped');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        kyc_level INTEGER DEFAULT 0,
        kyc_status TEXT DEFAULT 'pending',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    log('✓ Users table created');

    // Create user_profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.users(id),
        quidax_id TEXT,
        full_name TEXT,
        kyc_tier TEXT DEFAULT 'unverified',
        kyc_verified BOOLEAN DEFAULT FALSE,
        referral_code TEXT UNIQUE,
        daily_limit DECIMAL(20, 2) DEFAULT 0,
        monthly_limit DECIMAL(20, 2) DEFAULT 0,
        documents JSONB DEFAULT '{}'::jsonb,
        is_test BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `);
    log('✓ User profiles table created');

    // Create wallets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.wallets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.users(id),
        currency TEXT NOT NULL CHECK (currency IN ('NGN', 'BTC', 'ETH', 'USDT', 'USDC')),
        balance DECIMAL(20, 8) DEFAULT 0,
        pending_balance DECIMAL(20, 8) DEFAULT 0,
        total_deposits DECIMAL(20, 8) DEFAULT 0,
        total_withdrawals DECIMAL(20, 8) DEFAULT 0,
        is_test BOOLEAN DEFAULT FALSE,
        quidax_wallet_id TEXT,
        last_transaction_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, currency)
      );
    `);
    log('✓ Wallets table created');

    log('\n✨ Trade tables setup completed successfully');
  } catch (error) {
    log('\n❌ Setup failed:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}

setupTradeTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 