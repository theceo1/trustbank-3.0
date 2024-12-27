//scripts/fix-users.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';
import debug from 'debug';

const log = debug('fix:users');
debug.enable('fix:*');

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyUserLogin(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      log(`❌ Login verification failed for ${email}:`, error.message);
      return false;
    }

    if (data.user) {
      log(`✅ Login verification successful for ${email}`);
      return true;
    }

    return false;
  } catch (error) {
    log(`❌ Login verification error for ${email}:`, error);
    return false;
  }
}

async function fixUsers() {
  try {
    const usersToFix = [
      {
        id: 'f3a531cd-976a-41af-b55d-c751109bd1c3',
        email: 'user9@trustbank.tech'
      },
      {
        id: '20e31c39-a71b-4ac2-acfe-057682ea3dc4',
        email: 'user4@trustbank.tech'
      },
      {
        id: '76fd332b-3716-4e7c-973f-4d9d1f6008bb',
        email: 'user2@trustbank.tech'
      }
    ];

    for (const user of usersToFix) {
      log(`\n🔧 Starting fix process for ${user.email}...`);
      
      // Step 1: Verify user exists
      const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserById(user.id);
      
      if (checkError) {
        log(`❌ User check failed for ${user.email}:`, checkError.message);
        continue;
      }

      if (!existingUser) {
        log(`❌ User not found: ${user.email}`);
        continue;
      }

      // Step 2: Update user
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { 
          email_confirm: true,
          password: 'SecureUserPass123!',
          user_metadata: {
            ...existingUser.user.user_metadata,
            is_verified: true,
            email_verified: true
          }
        }
      );

      if (updateError) {
        log(`❌ Update failed for ${user.email}:`, updateError.message);
        continue;
      }

      // Step 3: Verify user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();

      if (profileError) {
        log(`⚠️ Profile check failed for ${user.email}:`, profileError.message);
      }

      if (!profile) {
        log(`⚠️ Creating profile for ${user.email}...`);
        const { error: createProfileError } = await supabase
          .from('users')
          .insert([
            { 
              id: user.id,
              email: user.email,
              is_verified: true
            }
          ]);

        if (createProfileError) {
          log(`❌ Profile creation failed for ${user.email}:`, createProfileError.message);
        }
      }

      // Step 4: Verify login works
      const loginWorks = await verifyUserLogin(user.email, 'SecureUserPass123!');
      
      if (loginWorks) {
        log(`\n✅ Successfully fixed ${user.email}`);
        log('Login credentials:');
        log(`Email: ${user.email}`);
        log(`Password: SecureUserPass123!`);
      } else {
        log(`\n⚠️ Fix completed but login verification failed for ${user.email}`);
        log('Please check the following:');
        log('1. Email confirmation status');
        log('2. User metadata');
        log('3. Auth policies');
      }
    }
    
    log('\n🎉 User fixing process complete!');
    
  } catch (error: any) {
    log('❌ Script failed:', error.message || error);
    process.exit(1);
  }
}

fixUsers(); 