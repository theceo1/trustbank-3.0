import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('auth:fix');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAuthSequences() {
  let client;
  try {
    client = await pool.connect();
    
    // 1. Set role to postgres first to grant permissions
    await client.query('SET ROLE postgres');
    
    // 2. Grant usage on extensions schema
    await client.query(`
      GRANT USAGE ON SCHEMA extensions TO supabase_auth_admin;
      GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO supabase_auth_admin;
    `);
    
    // 3. Now switch to auth admin role
    await client.query('SET ROLE supabase_auth_admin');
    
    // 4. Drop existing sequence if any
    await client.query('DROP SEQUENCE IF EXISTS auth.users_id_seq');
    
    // 5. Set UUID default for id column
    await client.query(`
      ALTER TABLE auth.users 
      ALTER COLUMN id SET DEFAULT extensions.uuid_generate_v4();
    `);

    log('✅ Auth sequences fixed successfully');

  } catch (error) {
    log('❌ Failed to fix sequences:', error);
    throw error;
  } finally {
    if (client) {
      await client.query('RESET ROLE');
      client.release();
    }
  }
}

fixAuthSequences(); 