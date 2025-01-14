import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { quidax_id } = await request.json();
    
    if (!quidax_id) {
      return NextResponse.json({ error: 'Quidax ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update user profile with Quidax ID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ quidax_id })
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
      data: { quidax_id }
    });
  } catch (error) {
    console.error('Error updating Quidax ID:', error);
    return NextResponse.json(
      { error: 'Failed to update Quidax ID' },
      { status: 500 }
    );
  }
} 