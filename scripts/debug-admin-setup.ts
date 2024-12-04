import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function debugAdminSetup() {
  console.log('🔍 Starting admin setup debug...\n');

  try {
    // 1. Check Auth User
    console.log('1️⃣ Checking auth user...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw new Error(`Auth error: ${authError.message}`);
    
    const adminUser = users.find(u => u.email === 'admin001@trustbank.tech');
    console.log('Auth user exists:', !!adminUser);
    if (adminUser) {
      console.log('Auth user ID:', adminUser.id);
      console.log('Auth user metadata:', adminUser.user_metadata);
    }

    // 2. Check Public Users Table
    console.log('\n2️⃣ Checking public users table...');
    const { data: publicUser, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin001@trustbank.tech')
      .single();
    
    if (publicError && publicError.code !== 'PGRST116') {
      throw new Error(`Public users error: ${publicError.message}`);
    }
    console.log('Public user exists:', !!publicUser);
    if (publicUser) console.log('Public user data:', publicUser);

    // 3. Check Admin Role
    console.log('\n3️⃣ Checking admin role...');
    const { data: roleData, error: roleError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('name', 'super_admin')
      .single();
    
    if (roleError && roleError.code !== 'PGRST116') {
      throw new Error(`Admin role error: ${roleError.message}`);
    }
    console.log('Admin role exists:', !!roleData);
    if (roleData) console.log('Role data:', roleData);

    // 4. Check Admin User Entry
    console.log('\n4️⃣ Checking admin user entry...');
    const { data: adminEntry, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', adminUser?.id)
      .single();
    
    if (adminError && adminError.code !== 'PGRST116') {
      throw new Error(`Admin user entry error: ${adminError.message}`);
    }
    console.log('Admin user entry exists:', !!adminEntry);
    if (adminEntry) console.log('Admin entry data:', adminEntry);

    // 5. Check Admin Access Cache
    console.log('\n5️⃣ Checking admin access cache...');
    const { data: cacheEntry, error: cacheError } = await supabase
      .from('admin_access_cache')
      .select('*')
      .eq('user_id', adminUser?.id)
      .single();
    
    if (cacheError && cacheError.code !== 'PGRST116') {
      throw new Error(`Access cache error: ${cacheError.message}`);
    }
    console.log('Access cache entry exists:', !!cacheEntry);
    if (cacheEntry) console.log('Cache entry data:', cacheEntry);

  } catch (error) {
    console.error('\n❌ Debug failed:', error);
    process.exit(1);
  }
}

debugAdminSetup(); 