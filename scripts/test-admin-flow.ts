import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testAdminFlow() {
  try {
    // Sign in as admin
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin001@trustbank.tech',
      password: 'SecureAdminPass123!'
    });

    if (signInError) throw signInError;

    // Test admin access
    const { data: adminData, error: adminError } = await supabase
      .from('admin_access_cache')
      .select('*')
      .eq('user_id', session?.user.id)
      .single();

    console.log('Admin access data:', adminData);

    // Test admin permissions
    const { data: roleData, error: roleError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('name', 'super_admin')
      .single();

    console.log('Admin role data:', roleData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminFlow();