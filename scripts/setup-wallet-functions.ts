import { Pool } from 'pg';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupWalletFunctions() {
  let client;
  try {
    console.log('🔧 Setting up wallet functions...');
    client = await pool.connect();

    // Create functions
    await client.query(`
      -- Create timestamp update function
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language plpgsql;

      -- Create wallet balance update function
      CREATE OR REPLACE FUNCTION update_wallet_balance(
        p_wallet_id UUID,
        p_amount DECIMAL,
        p_type TEXT
      ) RETURNS wallets AS $$
      DECLARE
        v_wallet wallets;
      BEGIN
        UPDATE wallets
        SET 
          balance = CASE 
            WHEN p_type = 'credit' THEN balance + p_amount
            WHEN p_type = 'debit' THEN balance - p_amount
            ELSE balance
          END,
          total_deposits = CASE 
            WHEN p_type = 'credit' THEN total_deposits + p_amount
            ELSE total_deposits
          END,
          total_withdrawals = CASE 
            WHEN p_type = 'debit' THEN total_withdrawals + p_amount
            ELSE total_withdrawals
          END,
          last_transaction_at = NOW()
        WHERE id = p_wallet_id
        RETURNING * INTO v_wallet;
        
        RETURN v_wallet;
      END;
      $$ LANGUAGE plpgsql;

      -- Drop existing trigger if exists
      DROP TRIGGER IF EXISTS update_wallets_timestamp ON wallets;

      -- Create new trigger
      CREATE TRIGGER update_wallets_timestamp
      BEFORE UPDATE ON wallets
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
    `);

    console.log('✅ Wallet functions created successfully');
  } catch (error) {
    console.error('❌ Failed to create wallet functions:', error);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
  }
}

setupWalletFunctions(); 