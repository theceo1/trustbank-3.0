import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { Pool } from 'pg';

const log = debug('setup:user-tables');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupUserTables() {
  let client;
  try {
    log('Creating user tables...');
    client = await pool.connect();

    // Create users table with all required fields
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        kyc_level INTEGER DEFAULT 0,
        kyc_status TEXT DEFAULT 'pending',
        kyc_submitted_at TIMESTAMPTZ,
        kyc_approved_at TIMESTAMPTZ,
        kyc_rejected_at TIMESTAMPTZ,
        kyc_rejection_reason TEXT,
        quidax_id TEXT
      );
    `);
    log('✓ Users table created/updated');

    // Add any missing columns to existing table
    const alterTableQueries = [
      "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS quidax_id TEXT;",
      "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 0;",
      "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending';",
      "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;",
      "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_approved_at TIMESTAMPTZ;",
      "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_rejected_at TIMESTAMPTZ;",
      "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;"
    ];

    for (const query of alterTableQueries) {
      await client.query(query);
    }
    log('✓ Added missing columns if any');

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

setupUserTables(); 