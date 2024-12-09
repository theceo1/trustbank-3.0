import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('user:delete');
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deleteUser(email: string) {
  try {
    console.log(`Attempting to delete user: ${email}`);
    
    // First find the user
    const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
    if (fetchError) throw fetchError;

    const user = (users as User[]).find(u => u.email === email);
    if (!user) {
      console.log('User not found');
      return;
    }

    // Delete related data first
    await Promise.all([
      supabase.from('wallets').delete().eq('user_id', user.id),
      supabase.from('user_profiles').delete().eq('user_id', user.id),
      supabase.from('users').delete().eq('id', user.id)
    ]);

    // Finally delete the auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    console.log('User and related data deleted successfully');
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error; // Re-throw to ensure process exits with error
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

deleteUser(email)
  .then(() => process.exit(0))
  .catch(() => process.exit(1)); 