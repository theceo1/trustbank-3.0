import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('setup:profile-tables');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupProfileTables() {
  let client;
  try {
    log('Setting up profile and KYC tables...');
    client = await pool.connect();

    // Drop existing user_profiles table to recreate with new schema
    await client.query(`DROP TABLE IF EXISTS public.user_profiles CASCADE;`);

    // Create user_profiles table with all required fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.users(id),
        quidax_id TEXT,
        kyc_tier TEXT DEFAULT 'unverified',
        kyc_verified BOOLEAN DEFAULT FALSE,
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

    // Add is_test column to wallets table
    await client.query(`
      ALTER TABLE public.wallets 
      ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;
    `);
    log('✓ Wallets table updated');

    log('\n✨ Profile tables setup completed successfully');

  } catch (error: any) {
    log('\n❌ Setup failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE'
    });
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

setupProfileTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 