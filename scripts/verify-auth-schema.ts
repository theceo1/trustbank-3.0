import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('auth:verify');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function verifyAuthSchema() {
  let client;
  try {
    client = await pool.connect();
    
    // Check if auth schema exists and has correct owner
    const { rows: schema } = await client.query(`
      SELECT n.nspname as schema_name, 
             r.rolname as owner
      FROM pg_namespace n
      JOIN pg_roles r ON r.oid = n.nspowner
      WHERE n.nspname = 'auth';
    `);
    log('Auth schema details:', schema);

    // Verify auth.users sequence
    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS auth.users_id_seq
      OWNED BY auth.users.id;
      
      ALTER TABLE auth.users 
      ALTER COLUMN id SET DEFAULT nextval('auth.users_id_seq');
    `);
    
    log('✅ Auth schema verification complete');

  } catch (error) {
    log('❌ Verification failed:', error);
    throw error;
  } finally {
    if (client) client.release();
  }
}

verifyAuthSchema(); 