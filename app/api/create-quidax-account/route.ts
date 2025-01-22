import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService, QuidaxUser } from '@/lib/services/quidax';

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
      .select('quidax_id, email, full_name')
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

    // Split full name into first and last name
    const [firstName, ...lastNameParts] = (profile.full_name || '').split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    // Create Quidax account
    const quidaxResponse = await QuidaxService.createSubAccount({
      email: profile.email || user.email,
      first_name: firstName,
      last_name: lastName,
      country: 'NG'
    });

    if (!quidaxResponse?.data?.id) {
      throw new Error('Failed to create Quidax account');
    }

    // Update user profile with Quidax ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ quidax_id: quidaxResponse.data.id })
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
      data: { quidax_user_id: quidaxResponse.data.id }
    });
  } catch (error) {
    console.error('Error creating Quidax account:', error);
    return NextResponse.json(
      { error: 'Failed to create Quidax account' },
      { status: 500 }
    );
  }
} 