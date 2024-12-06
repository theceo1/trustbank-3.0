import { createClient, User } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyTestUser() {
  const testEmail = 'user2@trustbank.tech';
  
  try {
    // 1. Check if user exists in auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;
    
    const authUser = (users as User[]).find(u => u.email === testEmail);
    console.log('Auth user exists:', !!authUser);
    if (authUser) {
      console.log('Auth user details:', {
        id: authUser.id,
        email: authUser.email,
        emailConfirmed: authUser.email_confirmed_at,
        lastSignIn: authUser.last_sign_in_at
      });
    }

    // 2. Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();
      
    console.log('\nUser profile exists:', !!profile);
    if (profile) console.log('Profile details:', profile);

    // 3. Try test login
    const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'SecureUserPass123!'
    });

    console.log('\nLogin test:', loginError ? 'Failed' : 'Successful');
    if (loginError) console.log('Login error:', loginError);
    if (session) console.log('Session created successfully');

  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyTestUser(); 