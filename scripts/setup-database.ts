//scripts/setup-database.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';
import { Pool } from 'pg';

const log = debug('db:setup');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setupDatabase() {
  let client;
  try {
    log(' Starting database setup...');
    
    // Get database connection
    log('Connecting to database...');
    client = await pool.connect();
    log('✓ Database connection successful');

    // Create utility functions
    log('Creating utility functions...');
    const functions = [
      `
      create or replace function install_extensions()
      returns void as $$
      begin
        create extension if not exists "uuid-ossp";
        create extension if not exists pgcrypto;
      end;
      $$ language plpgsql security definer;
      `,
      `
      create or replace function create_schema_if_not_exists(schema_name text)
      returns void as $$
      begin
        execute format('create schema if not exists %I', schema_name);
      end;
      $$ language plpgsql security definer;
      `,
      `
      create or replace function grant_permissions()
      returns void as $$
      begin
        grant usage on schema public to authenticated;
        grant usage on schema public to service_role;
        grant all on all tables in schema public to authenticated;
        grant all on all sequences in schema public to authenticated;
        grant all on all tables in schema public to service_role;
        grant all on all sequences in schema public to service_role;
      end;
      $$ language plpgsql security definer;
      `
    ];

    await client.query('BEGIN');

    try {
      for (const sql of functions) {
        log('Creating function...');
        await client.query(sql);
      }
      log('✓ Utility functions created');

      // Enable extensions
      log('Enabling extensions...');
      await client.query('SELECT install_extensions()');
      log('✓ Extensions enabled');

      // Create auth schema
      log('Creating auth schema...');
      await client.query('SELECT create_schema_if_not_exists($1)', ['auth']);
      log('✓ Auth schema created');

      // Grant permissions
      log('Granting permissions...');
      await client.query('SELECT grant_permissions()');
      log('✓ Permissions granted');

      // Create admin tables
      log('Creating admin tables...');
      const adminTables = [
        `
        create table if not exists public.admin_roles (
          id uuid primary key default uuid_generate_v4(),
          name text unique not null,
          permissions jsonb default '{}',
          created_at timestamptz default now(),
          updated_at timestamptz default now()
        );
        `,
        `
        create table if not exists public.admin_users (
          id uuid primary key default uuid_generate_v4(),
          user_id uuid references auth.users(id) on delete cascade,
          role_id uuid references public.admin_roles(id),
          is_active boolean default true,
          created_at timestamptz default now(),
          updated_at timestamptz default now(),
          unique(user_id)
        );
        `,
        `
        create table if not exists public.admin_access_cache (
          user_id uuid primary key references auth.users(id) on delete cascade,
          is_admin boolean default false,
          permissions jsonb default '{}',
          last_checked timestamptz default now()
        );
        `
      ];

      for (const sql of adminTables) {
        await client.query(sql);
      }
      log('✓ Admin tables created');

      await client.query('COMMIT');
      log('\n✨ Database setup completed successfully');

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('\n❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    if (client) client.release();
  }
}

setupDatabase(); 