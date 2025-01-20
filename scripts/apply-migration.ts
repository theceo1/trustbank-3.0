import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import debug from 'debug';
import { checkMigrations } from './check-migrations';

const log = debug('migrations:apply');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    db: {
      schema: 'public'
    }
  }
);

async function applyMigration() {
  try {
    console.log('Applying migration...');
    
    // Read migration file
    const migrationSQL = readFileSync(
      resolve(process.cwd(), 'migrations/20240322_fix_user_profiles.sql'),
      'utf8'
    );

    // Apply migration
    const { error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) throw error;

    console.log('Migration applied successfully');

    // Run check-migrations to verify
    await checkMigrations();

  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration(); 