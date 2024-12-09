//scripts/setup-profile-tables.ts
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
    console.log('Setting up profile and KYC tables...');
    log('Setting up profile and KYC tables...');
    client = await pool.connect();

    // Create user_profiles table without dropping
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.users(id),
        quidax_id TEXT,
        kyc_tier TEXT DEFAULT 'unverified',
        kyc_verified BOOLEAN DEFAULT FALSE,
        daily_limit DECIMAL(20, 2) DEFAULT 0,
        monthly_limit DECIMAL(20, 2) DEFAULT 0,
        referral_code TEXT,
        documents JSONB DEFAULT '{}'::jsonb,
        is_test BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `);
    console.log('✓ User profiles table created');
    log('✓ User profiles table created');

    // Add any missing columns
    const alterTableQueries = [
      "ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;",
      "ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;",
      "ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS kyc_tier TEXT DEFAULT 'unverified';"
    ];

    for (const query of alterTableQueries) {
      await client.query(query);
    }

    console.log('✨ Profile tables setup completed successfully');
    log('✨ Profile tables setup completed successfully');

  } catch (error: any) {
    console.error('❌ Setup failed:', error);
    log('❌ Setup failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE'
    });
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

setupProfileTables();