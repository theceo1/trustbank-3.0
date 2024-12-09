import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixAuthSetup() {
  let client;
  try {
    console.log('🔧 Fixing auth setup...');
    client = await pool.connect();

    // 1. Create required extensions
    console.log('\nCreating required extensions...');
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    `);

    // 2. Fix permissions
    console.log('\nFixing permissions...');
    await client.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON SEQUENCES TO service_role;
      ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON FUNCTIONS TO service_role;
      
      GRANT USAGE ON SCHEMA auth TO service_role;
      GRANT ALL ON ALL TABLES IN SCHEMA auth TO service_role;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO service_role;
      GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO service_role;
    `);

    // 3. Create required triggers
    console.log('\nCreating required triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION auth.handle_user_update()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
      CREATE TRIGGER on_auth_user_updated
        BEFORE UPDATE ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION auth.handle_user_update();
    `);

    console.log('✅ Auth setup fixed successfully');

  } catch (error: any) {
    console.error('❌ Fix failed:', error?.message);
    throw error;
  } finally {
    if (client) client.release();
  }
}

fixAuthSetup(); 