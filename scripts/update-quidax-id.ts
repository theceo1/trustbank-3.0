import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateQuidaxId() {
  try {
    const email = 'test1735848851306@trustbank.tech';
    const quidaxId = '157fa815-214e-4ecd-8a25-448fe4815ff1';

    // Get user from auth.users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;

    const user = users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found in auth.users');
    }

    console.log('Found user:', user.id);

    // Update user profile with Quidax ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ quidax_id: quidaxId })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    console.log('Successfully updated Quidax ID for user:', email);

  } catch (error) {
    console.error('Error:', error);
  }
}

updateQuidaxId().catch(console.error); 