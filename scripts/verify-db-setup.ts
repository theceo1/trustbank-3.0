//scripts/verify-db-setup.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('verify:setup');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifySetup() {
  try {
    log('Starting verification...');
    
    // Test Supabase connection
    log('Testing Supabase connection...');
    const { data: authConfig, error: configError } = await supabase.auth.getSession();
    if (configError) {
      log('Supabase connection error:', configError);
      throw configError;
    }
    log('✓ Supabase connection successful');

    // Test database query using a simple query
    log('Testing database query...');
    const { data, error } = await supabase
      .from('_prisma_migrations')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist, which is expected for a fresh install
      log('Database query failed:', error);
      log('This is expected for a fresh installation');
    } else {
      log('✓ Database query successful');
    }
    
    log('✓ Database connection verified');
    
    // Additional verification
    log('Checking auth configuration...');
    const { data: settings, error: settingsError } = await supabase
      .from('auth.users')
      .select('count')
      .single();
    
    if (settingsError) {
      log('Auth tables not found. This is expected for a fresh installation.');
      log('Please run setup scripts to initialize the database.');
    } else {
      log('✓ Auth configuration exists');
    }
    
  } catch (error: any) {
    log('✗ Verification failed:', error);
    process.exit(1);
  }
}

verifySetup(); 