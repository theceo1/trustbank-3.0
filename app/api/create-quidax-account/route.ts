import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id, email')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    // If user already has a Quidax ID, return it
    if (profile.quidax_id) {
      return NextResponse.json({
        status: 'success',
        data: { quidax_user_id: profile.quidax_id }
      });
    }

    // Create Quidax account
    const quidaxUser = await QuidaxService.createUser({
      email: profile.email || user.email,
      first_name: user.user_metadata?.first_name || 'User',
      last_name: user.user_metadata?.last_name || String(user.id).slice(-4),
      phone: user.user_metadata?.phone || '',
      country: 'NG'
    });

    if (!quidaxUser?.id) {
      throw new Error('Failed to create Quidax account');
    }

    // Update user profile with Quidax ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ quidax_id: quidaxUser.id })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: { quidax_user_id: quidaxUser.id }
    });
  } catch (error) {
    console.error('Error creating Quidax account:', error);
    return NextResponse.json(
      { error: 'Failed to create Quidax account' },
      { status: 500 }
    );
  }
} 