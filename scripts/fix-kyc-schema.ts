// scripts/fix-kyc-schema.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

// Define KYCTier enum directly in the script
enum KYCTier {
  NONE = 0,
  BASIC = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3
}

const log = debug('fix:kyc');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixKYCSchema() {
  let client;
  try {
    log('🔧 Starting KYC schema fixes...');
    client = await pool.connect();

    // Step 1: Add missing columns
    const alterTableQueries = [
      `ALTER TABLE user_profiles 
       DROP COLUMN IF EXISTS kyc_tier,
       DROP COLUMN IF EXISTS kyc_verified,
       DROP COLUMN IF EXISTS kyc_data,
       DROP COLUMN IF EXISTS documents,
       ADD COLUMN IF NOT EXISTS full_name text,
       ADD COLUMN IF NOT EXISTS kyc_status text DEFAULT 'pending',
       ADD COLUMN IF NOT EXISTS kyc_level integer DEFAULT 0,
       ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false,
       ADD COLUMN IF NOT EXISTS verification_ref text,
       ADD COLUMN IF NOT EXISTS kyc_documents jsonb DEFAULT '{}'::jsonb,
       ADD COLUMN IF NOT EXISTS daily_limit DECIMAL(20, 2) DEFAULT 0,
       ADD COLUMN IF NOT EXISTS monthly_limit DECIMAL(20, 2) DEFAULT 0,
       ADD COLUMN IF NOT EXISTS referral_code text,
       ADD COLUMN IF NOT EXISTS is_test boolean DEFAULT false;`,
      
      // Drop old columns
      `ALTER TABLE user_profiles 
       DROP COLUMN IF EXISTS kyc_tier,
       DROP COLUMN IF EXISTS kyc_verified;`,

      // Update existing records
      `UPDATE user_profiles 
       SET kyc_level = ${KYCTier.NONE},
           kyc_status = 'unverified',
           is_verified = false,
           daily_limit = 50000,
           monthly_limit = 1000000
       WHERE kyc_level IS NULL;`,

      // Create index for faster queries
      `CREATE INDEX IF NOT EXISTS idx_user_profiles_kyc 
       ON user_profiles(user_id, kyc_level, kyc_status);`,

      // Update all users to have correct KYC limits
      `UPDATE user_profiles 
       SET daily_limit = CASE 
         WHEN kyc_level = 0 THEN 50000
         WHEN kyc_level = 1 THEN 100000
         WHEN kyc_level = 2 THEN 200000
         WHEN kyc_level = 3 THEN 500000
         ELSE 50000
       END,
       monthly_limit = CASE 
         WHEN kyc_level = 0 THEN 1000000
         WHEN kyc_level = 1 THEN 2000000
         WHEN kyc_level = 2 THEN 5000000
         WHEN kyc_level = 3 THEN 10000000
         ELSE 1000000
       END
       WHERE kyc_level IS NOT NULL;`
    ];

    for (const query of alterTableQueries) {
      await client.query(query);
      log('✓ Schema update completed');
    }

    // Step 2: Update test user
    const { rows: [userData] } = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['user8@trustbank.tech']
    );

    if (userData) {
      await client.query(
        `UPDATE user_profiles 
         SET kyc_level = $1,
             kyc_status = 'approved',
             is_verified = true,
             daily_limit = 200000,
             monthly_limit = 5000000,
             verification_ref = 'test_verification'
         WHERE user_id = $2`,
        [KYCTier.INTERMEDIATE, userData.id]
      );
      log('✓ Test user updated');
    }

    log('✨ KYC schema migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

fixKYCSchema(); 