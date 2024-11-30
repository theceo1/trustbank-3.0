import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile data
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Create Quidax sub-account
    const quidaxUser = await QuidaxService.createSubAccount({
      email: user.email!,
      first_name: profile?.full_name?.split(' ')[0] || 'User',
      last_name: profile?.full_name?.split(' ').slice(1).join(' ') || String(user.id)
    });

    // Store Quidax user ID in profile
    await supabase
      .from('user_profiles')
      .update({ 
        quidax_user_id: quidaxUser.data.id,
        metadata: {
          ...profile?.metadata,
          quidax_data: quidaxUser.data
        }
      })
      .eq('id', user.id);

    return NextResponse.json(quidaxUser);
  } catch (error: any) {
    console.error('Sub-account creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create sub-account' },
      { status: 500 }
    );
  }
} 