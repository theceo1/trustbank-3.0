import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('migrations:check');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

interface DbInfo {
  db: string;
  schema: string;
  user: string;
}

interface TableInfo {
  table_name: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface ForeignKeyInfo {
  column_name: string;
  referenced_table_name: string;
  referenced_column_name: string;
}

interface IndexInfo {
  indexname: string;
  indexdef: string;
}

interface TriggerInfo {
  tgname: string;
  definition: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkMigrations() {
  try {
    console.log('Checking database setup...');
    console.log('Using URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

    // Check if tables exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) {
      console.error('Error checking users table:', usersError);
    } else {
      console.log('users table exists');
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (profilesError) {
      console.error('Error checking user_profiles table:', profilesError);
    } else {
      console.log('user_profiles table exists');
    }

    // Check user_profiles table structure
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'user_profiles'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    }) as { data: ColumnInfo[] | null, error: Error | null };

    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
    } else {
      console.log('\nuser_profiles table structure:');
      columns?.forEach((col: ColumnInfo) => {
        console.log(`${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }

    // Check foreign key constraints
    const { data: fks, error: fksError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT
          kcu.column_name,
          ccu.table_name AS referenced_table_name,
          ccu.column_name AS referenced_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'user_profiles'
        AND tc.table_schema = 'public';
      `
    }) as { data: ForeignKeyInfo[] | null, error: Error | null };

    if (fksError) {
      console.error('Error fetching foreign keys:', fksError);
    } else {
      console.log('\nForeign key constraints:');
      fks?.forEach((fk: ForeignKeyInfo) => {
        console.log(`${fk.column_name} -> ${fk.referenced_table_name}.${fk.referenced_column_name}`);
      });
    }

    // Check indexes
    const { data: indexes, error: indexesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename = 'user_profiles'
        ORDER BY indexname;
      `
    }) as { data: IndexInfo[] | null, error: Error | null };

    if (indexesError) {
      console.error('Error fetching indexes:', indexesError);
    } else {
      console.log('\nIndexes on user_profiles:');
      indexes?.forEach((idx: IndexInfo) => {
        console.log(`${idx.indexname}: ${idx.indexdef}`);
      });
    }

    // Check if trigger exists
    const { data: triggers, error: triggersError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT tgname, pg_get_triggerdef(t.oid) as definition
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'on_auth_user_created'
        AND n.nspname = 'auth'
        AND c.relname = 'users';
      `
    }) as { data: TriggerInfo[] | null, error: Error | null };

    if (triggersError) {
      console.error('Error fetching trigger:', triggersError);
    } else {
      console.log('\nProfile creation trigger:', triggers?.length ? 'exists' : 'missing');
      if (triggers?.length) {
        console.log('Trigger definition:', triggers[0].definition);
      }
    }

  } catch (error) {
    console.error('Error checking migrations:', error);
  }
}

checkMigrations(); 