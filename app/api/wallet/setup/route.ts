// app/api/wallet/setup/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { QuidaxService } from '@/app/lib/services/quidax';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    // If user has a Quidax ID, verify account exists
    if (profile.quidax_id) {
      const quidaxUser = await QuidaxService.getSubAccount(profile.quidax_id);
      
      return NextResponse.json({
        status: 'success',
        message: 'Quidax account verified',
        data: { quidax_id: profile.quidax_id }
      });
    }

    return NextResponse.json(
      { error: 'Quidax account not found' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in wallet setup:', error);
    return NextResponse.json(
      { error: 'Failed to verify Quidax account' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('quidax_id')
      .eq('user_id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      );
    }

    if (!profile.quidax_id) {
      return NextResponse.json(
        { error: 'Quidax account not found' },
        { status: 400 }
      );
    }

    // Verify Quidax account exists
    const quidaxUser = await QuidaxService.getSubAccount(profile.quidax_id);

    return NextResponse.json({
      status: 'success',
      message: 'Quidax account verified',
      data: { quidax_id: profile.quidax_id }
    });
  } catch (error) {
    console.error('Error checking Quidax account:', error);
    return NextResponse.json(
      { error: 'Failed to verify Quidax account' },
      { status: 500 }
    );
  }
} 