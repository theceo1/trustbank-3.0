import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import debug from 'debug';

const log = debug('user:delete');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function deleteUser(email: string) {
  try {
    log('Deleting user...');
    
    // List users to find the user ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find(u => u.email === email);
    if (!user) {
      log('User not found');
      return;
    }

    // Delete the user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    log('User deleted successfully');

  } catch (error: any) {
    log('\n❌ Deletion failed:', {
      message: error?.message || 'Unknown error',
      code: error?.code || 'NO_CODE'
    });
    process.exit(1);
  }
}

// Delete the user
deleteUser('user001@trustbank.tech'); 