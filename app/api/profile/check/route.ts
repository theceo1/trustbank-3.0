import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Get complete user profile data
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ 
        error: 'Failed to fetch profile',
        details: profileError
      }, { status: 500 });
    }

    // Get user data from auth.users
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return NextResponse.json({
      status: 'success',
      profile: userProfile,
      user: userData,
      session: session
    });

  } catch (error) {
    console.error('Profile check error:', error);
    return NextResponse.json({ 
      error: 'Failed to check profile',
      details: error
    }, { status: 500 });
  }
} 