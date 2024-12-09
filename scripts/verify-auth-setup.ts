// scripts/verify-auth-setup.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { Pool } from 'pg';

const log = debug('auth:verify');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function verifyAuthSetup() {
  let client;
  try {
    log('🔍 Verifying auth setup...');
    
    client = await pool.connect();
    
    // Check if tables exist
    const tables = ['users', 'identities', 'sessions', 'mfa_factors', 'one_time_tokens'];
    for (const table of tables) {
      const { rows } = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'auth' 
          AND table_name = $1
        );
      `, [table]);
      
      if (rows[0].exists) {
        log(`✓ auth.${table} table exists`);
      } else {
        log(`✗ auth.${table} table missing`);
      }
    }

    log('✨ Verification complete');

  } catch (error: any) {
    log('\n❌ Verification failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE'
    });
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

verifyAuthSetup(); 