// app/api/auth/signup/route.ts
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ProfileService } from '@/lib/services/profile';

export const dynamic = 'force-dynamic';

async function waitForUser(userId: string, maxAttempts = 5): Promise<boolean> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (user) return true;
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    console.log('Signup request:', { email, name });

    // Initialize Supabase client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create the user with admin API
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name
      }
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    if (!user) {
      console.error('No user returned from signup');
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
    }

    console.log('User created:', user.id);

    // Wait for database trigger to create user record
    const userExists = await waitForUser(user.id);
    if (!userExists) {
      console.error('User record not created in time');
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
    }

    // Create the user profile
    const profile = await ProfileService.createProfile(user.id, email);
    console.log('Profile created:', profile);

    // Sign in the user to establish a session
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return NextResponse.json({ error: signInError.message }, { status: 400 });
    }

    console.log('Session established:', session?.user.id);

    return NextResponse.json({ user, profile, session });
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 