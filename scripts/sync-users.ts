import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncUsers() {
  try {
    console.log('Starting user sync...');

    // Get all users from auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Failed to list users:', authError);
      return;
    }

    console.log(`Found ${users.length} users in auth.users`);

    // For each user, check and sync to public.users
    for (const user of users) {
      console.log(`\nProcessing user: ${user.email}`);

      // Check if user exists in public.users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`Error checking user ${user.email}:`, checkError);
        continue;
      }

      if (!existingUser) {
        console.log(`Creating public.users record for ${user.email}`);
        
        // Create user in public.users
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            first_name: user.user_metadata?.first_name || null,
            last_name: user.user_metadata?.last_name || null,
            is_verified: user.email_confirmed_at ? true : false,
            kyc_level: 0,
            kyc_status: 'pending',
            created_at: user.created_at,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Failed to create user ${user.email}:`, insertError);
          continue;
        }

        console.log(`✓ Created public.users record for ${user.email}`);
      } else {
        console.log(`User ${user.email} already exists in public.users`);
      }
    }

    console.log('\nSync completed successfully!');
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Run the sync
syncUsers(); 