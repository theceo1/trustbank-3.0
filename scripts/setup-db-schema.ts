import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupDbSchema() {
  console.log('🔧 Setting up database schema...');
  
  try {
    const client = await pool.connect();
    
    try {
      await client.query(`
        -- Create users table if not exists
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY REFERENCES auth.users(id),
          email TEXT UNIQUE,
          first_name TEXT,
          last_name TEXT,
          is_verified BOOLEAN DEFAULT false,
          kyc_level INTEGER DEFAULT 0,
          kyc_status TEXT DEFAULT 'pending',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create user_profiles table if not exists
        CREATE TABLE IF NOT EXISTS public.user_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id),
          referral_code TEXT UNIQUE,
          kyc_tier TEXT DEFAULT 'tier1',
          daily_limit BIGINT DEFAULT 100000,
          monthly_limit BIGINT DEFAULT 1000000,
          kyc_verified BOOLEAN DEFAULT false,
          documents JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        );

        -- Create wallets table if not exists
        CREATE TABLE IF NOT EXISTS public.wallets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES auth.users(id),
          currency TEXT NOT NULL,
          balance BIGINT DEFAULT 0,
          is_test BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, currency)
        );

        -- Enable required extensions
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `);

      console.log('✅ Database schema created successfully');
      
    } finally {
      client.release();
    }
    
  } catch (error: any) {
    console.error('❌ Schema setup failed:', error);
    process.exit(1);
  }
}

setupDbSchema();