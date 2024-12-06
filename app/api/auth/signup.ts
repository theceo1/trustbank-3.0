//app/api/auth/signups.ts test users
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const createTestUsers = async () => {
  const users = await Promise.all([
    createTestUser('user1@test.com', 'User1'),
    createTestUser('user2@test.com', 'User2')
  ]);
  return users;
};

async function createTestUser(email: string, lastName: string) {
  const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: 'hashedPassword1',
    email_confirm: true
  });

  if (createError) throw createError;
  if (!authUser.user) throw new Error('Failed to create auth user');

  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      email: email,
      first_name: 'Test',
      last_name: lastName
    });

  if (userError) throw userError;

  const { error: walletError } = await supabase
    .from('wallets')
    .insert({
      id: uuidv4(),
      user_id: authUser.user.id,
      currency: 'USDT',
      balance: 0,
      pending_balance: 0
    });

  if (walletError) throw walletError;

  return authUser.user;
}