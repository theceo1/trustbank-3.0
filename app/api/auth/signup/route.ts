// app/api/auth/signup/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ProfileService } from '@/lib/services/profile';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();
    console.log('Signup request:', { email, name });

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('Supabase config:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey 
    });

    const supabase = createRouteHandlerClient({ cookies });

    // Create the user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    if (!user) {
      console.error('No user returned from signup');
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
    }

    console.log('User created:', user);

    // Sign in the user to establish a session
    const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return NextResponse.json({ error: signInError.message }, { status: 400 });
    }

    console.log('Session established:', session);

    // Create the user profile
    const profile = await ProfileService.createProfile(user.id, email);
    console.log('Profile created:', profile);

    return NextResponse.json({ user, profile, session });
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 