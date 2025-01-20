import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkUserProfile() {
  try {
    // Get user's auth data
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Failed to list users:', authError);
      return;
    }

    const user = users.find(u => u.email === 'test1737329235710@trustbank.tech');
    if (!user) {
      console.error('User not found');
      return;
    }

    console.log('Found user:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch profile:', profileError);
      return;
    }

    console.log('User profile:', profile);

    // If no Quidax ID, create one
    if (!profile.quidax_id) {
      console.log('Creating Quidax account...');
      const response = await fetch('https://www.quidax.com/api/v1/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.QUIDAX_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          first_name: user.user_metadata?.first_name || 'Test',
          last_name: user.user_metadata?.last_name || 'User'
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to create Quidax account:', error);
        return;
      }

      const quidaxUser = await response.json();
      console.log('Created Quidax account:', quidaxUser);

      // Update user profile with Quidax ID
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ quidax_id: quidaxUser.data.id })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Failed to update profile:', updateError);
        return;
      }

      console.log('Updated profile with Quidax ID:', quidaxUser.data.id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserProfile().catch(console.error); 