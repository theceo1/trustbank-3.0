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

    // Create wallets table only
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