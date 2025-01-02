import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    console.log('Looking for user with email:', email);

    // First get the user from auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Failed to list users:', authError);
      return NextResponse.json({ 
        error: 'Failed to list users' 
      }, { status: 500 });
    }

    const authUser = users.find((user: User) => user.email === email);
    console.log('Found auth user:', authUser ? 'yes' : 'no');

    if (!authUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    console.log('Auth user ID:', authUser.id);

    // Get user profile using the auth user id
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ 
        error: 'User profile not found',
        details: profileError.message
      }, { status: 404 });
    }

    console.log('Found user profile:', userProfile);

    // Update KYC status
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        kyc_level: 1,
        is_verified: true,
        kyc_status: 'verified'
      })
      .eq('user_id', authUser.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update KYC status',
        details: updateError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      message: 'KYC status updated successfully',
      userId: authUser.id
    });

  } catch (error: any) {
    console.error('Update KYC status error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to update KYC status',
        details: error.stack
      },
      { status: 500 }
    );
  }
} 