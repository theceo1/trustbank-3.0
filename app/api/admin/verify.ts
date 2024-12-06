import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const verifyAdmin = async (userId: string) => {
  const { data: adminAccess } = await supabase
    .from('admin_access_cache')
    .select('is_admin')
    .eq('user_id', userId)
    .single();
    
  return adminAccess?.is_admin || false;
}