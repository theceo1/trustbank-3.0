import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { User } from '@supabase/supabase-js';

// Load environment variables from .env.local file
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function createAdmin(email: string, password: string) {
  try {
    // First try to list all users and find by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('List Error:', listError);
      throw listError;
    }

    let userId: string;
    const existingUser = (users as User[]).find(user => user.email === email);

    if (existingUser) {
      userId = existingUser.id;
      await supabase.auth.admin.updateUserById(userId, {
        password: password
      });
    } else {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Auth Error:', authError);
        throw authError;
      }

      if (!authUser.user) {
        throw new Error('No user created');
      }

      userId = authUser.user.id;
    }

    // Get admin role ID
    const { data: roleData, error: roleError } = await supabase
      .from('admin_roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (roleError) {
      console.error('Role Error:', roleError);
      throw roleError;
    }

    // Create or update admin user record
    const { error: adminError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: userId,
        role_id: roleData.id,
        is_active: true,
        last_login_at: new Date().toISOString()
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (adminError) {
      console.error('Admin Error:', adminError);
      throw adminError;
    }

    console.log('Admin user created/updated successfully');
  } catch (error) {
    console.error('Error creating/updating admin:', error);
    process.exit(1);
  }
}

// Get command line arguments
const [email, password] = process.argv.slice(2);
if (email && password) {
  createAdmin(email, password);
} else {
  console.error('Please provide email and password');
  process.exit(1);
}